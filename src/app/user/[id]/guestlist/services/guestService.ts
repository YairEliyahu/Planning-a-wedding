import { Guest, NewGuest } from '../context/GuestContext';
import * as XLSX from 'xlsx';

class GuestService {
  private apiBase = '/api/guests';

  async fetchGuests(userId: string): Promise<Guest[]> {
    try {
      console.log(`Fetching guests for user: ${userId}`);
      
      const response = await fetch(`${this.apiBase}?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch guests (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API returned unsuccessful response');
      }

      let fetchedGuests: Guest[] = [];
      
      if (data.guests) {
        if (Array.isArray(data.guests)) {
          fetchedGuests = data.guests;
        } else if (data.guests.sides) {
          fetchedGuests = [
            ...(data.guests.sides['חתן'] || []),
            ...(data.guests.sides['כלה'] || []),
            ...(data.guests.sides['משותף'] || [])
          ];
        }
      }
      
      // Filter out invalid guests
      const validatedGuests = fetchedGuests.filter(guest => {
        return guest && typeof guest === 'object' && guest.name && typeof guest.name === 'string';
      });

      // Remove example guests automatically
      const cleanedGuests = await this.removeExampleGuests(validatedGuests);
      
      return cleanedGuests;
      
    } catch (error) {
      console.error('Error in fetchGuests:', error);
      throw error;
    }
  }

  async addGuest(guestData: NewGuest & { userId: string }): Promise<Guest> {
    const response = await fetch(this.apiBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(guestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add guest - ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.guest) {
      throw new Error('No valid guest returned from server');
    }

    return data.guest;
  }

  async updateGuest(guest: Guest): Promise<Guest> {
    const response = await fetch(`${this.apiBase}/${guest._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(guest),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update guest');
    }
    
    return data.guest;
  }

  async deleteGuest(guestId: string): Promise<void> {
    const response = await fetch(`${this.apiBase}/${guestId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete guest');
    }
  }

  async confirmGuest(guestId: string, status: boolean | null): Promise<Guest> {
    const response = await fetch(`${this.apiBase}/${guestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isConfirmed: status }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update guest status');
    }
    
    return data.guest;
  }

  async deleteAllGuests(userId: string): Promise<{ deletedCount: number }> {
    const response = await fetch(`${this.apiBase}/delete-all?userId=${userId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete all guests');
    }
    
    return data;
  }

  async cleanupDuplicates(userId: string): Promise<{ removedCount: number }> {
    const response = await fetch(`${this.apiBase}/cleanup-duplicates?userId=${userId}`, {
      method: 'POST',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to cleanup duplicates');
    }
    
    return data;
  }

  async importGuests(
    file: File, 
    userId: string, 
    sharedEventId?: string,
    onProgress?: (current: number, total: number, currentName: string) => void
  ): Promise<{ 
    success: number, 
    error: number,
    errorDetails?: {
      missingName?: number,
      invalidPhone?: number, 
      apiErrors?: number,
      otherErrors?: number
    } 
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const rows = XLSX.utils.sheet_to_json(worksheet, { 
            defval: '',
            raw: false,
            header: 'A'
          });
          
          const filteredRows = rows.filter((row: any) => {
            const isHeader = Object.values(row).some(val => 
              typeof val === 'string' && 
              (val.includes('מוזמנים') || val.includes('מאושרות') || val.includes('שם המוזמן'))
            );
            
            const isEmpty = Object.values(row).every(val => val === '' || val === null || val === undefined);
            
            const isExample = Object.values(row).some(val => 
              typeof val === 'string' && 
              (val.includes('ישראל ישראלי') || val.includes('דוגמה להערה') || val.includes('שרה לוי'))
            );
            
            return !isHeader && !isEmpty && !isExample;
          });

          if (filteredRows.length === 0) {
            resolve({ 
              success: 0, 
              error: 1,
              errorDetails: { otherErrors: 1 }
            });
            return;
          }

          let successCount = 0;
          let errorCount = 0;
          let missingNameCount = 0;
          let apiErrorCount = 0;
          let otherErrorCount = 0;

          // Process each row with progress tracking
          for (let i = 0; i < filteredRows.length; i++) {
            const row = filteredRows[i];
            
            try {
              const processed = this.processExcelRow(row as Record<string, any>, userId, sharedEventId);
              
              if (!processed) {
                errorCount++;
                missingNameCount++;
                // Report progress even for failed rows
                onProgress?.(i + 1, filteredRows.length, `שורה ${i + 1} - שגיאה`);
                continue;
              }

              // Report progress with current guest name
              onProgress?.(i + 1, filteredRows.length, processed.name);

              const response = await fetch(this.apiBase, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(processed),
              });
              
              if (response.ok) {
                successCount++;
              } else {
                errorCount++;
                apiErrorCount++;
                const errorData = await response.text();
                console.error(`❌ API error for ${processed.name}:`, errorData);
              }
            } catch (error) {
              console.error('Error processing row:', error, row);
              errorCount++;
              otherErrorCount++;
              onProgress?.(i + 1, filteredRows.length, `שורה ${i + 1} - שגיאה`);
            }
          }
          
          resolve({ 
            success: successCount, 
            error: errorCount,
            errorDetails: {
              missingName: missingNameCount,
              apiErrors: apiErrorCount,
              otherErrors: otherErrorCount
            }
          });
          
        } catch (error) {
          console.error('Error processing Excel file:', error);
          reject(error);
        }
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  private processExcelRow(row: Record<string, any>, userId: string, sharedEventId?: string): NewGuest & { userId: string } | null {
    const columnKeys = Object.keys(row);
    
    // Fixed column order as requested:
    // Column 1: Name (שם המוזמן)
    // Column 2: Number of guests (מספר מוזמנים) 
    // Column 3: Phone (טלפון)
    // Column 4: Group (קבוצה)
    // Column 5: Side (צד - חתן/כלה/משותף)
    
    if (columnKeys.length < 1) {
      return null; // Need at least name column
    }
    
    // Get name from first column
    const guestName = String(row[columnKeys[0]] || '').trim();
    if (!guestName) {
      return null;
    }

    // Get number of guests from second column (if exists)
    let numberOfGuests = 1;
    if (columnKeys.length >= 2 && row[columnKeys[1]]) {
      const value = row[columnKeys[1]];
      
      if (typeof value === 'number') {
        numberOfGuests = Math.max(1, Math.round(value));
      } else if (typeof value === 'string') {
        const stringValue = value.trim().toLowerCase();
        
        // Handle specific Hebrew/English patterns
        if (stringValue.includes('זוג') || stringValue.includes('pair') || stringValue.includes('couple')) {
          numberOfGuests = 2;
        } else if (stringValue.includes('משפחה') || stringValue.includes('family')) {
          numberOfGuests = 4; // Default family size
        } else if (stringValue.includes('יחיד') || stringValue.includes('single') || stringValue.includes('לבד')) {
          numberOfGuests = 1;
        } else {
          // Extract numbers from text like "3", "3 אנשים", "שלושה", etc.
          const numberMatch = stringValue.match(/\d+/);
          if (numberMatch) {
            const parsed = parseInt(numberMatch[0]);
            if (!isNaN(parsed) && parsed > 0) {
              numberOfGuests = Math.min(parsed, 20); // Max 20 to prevent errors
            }
          } else {
            // Handle Hebrew number words
            const hebrewNumbers: Record<string, number> = {
              'אחד': 1, 'שניים': 2, 'שלושה': 3, 'ארבעה': 4, 'חמישה': 5,
              'שישה': 6, 'שבעה': 7, 'שמונה': 8, 'תשעה': 9, 'עשרה': 10,
              'אחת': 1, 'שתיים': 2
            };
            
            for (const [word, num] of Object.entries(hebrewNumbers)) {
              if (stringValue.includes(word)) {
                numberOfGuests = num;
                break;
              }
            }
          }
        }
      }
    }

    // Get phone from third column (if exists)
    let phoneNumber = '';
    if (columnKeys.length >= 3 && row[columnKeys[2]]) {
      phoneNumber = this.processPhoneNumber(String(row[columnKeys[2]]));
    }

    // Get group from fourth column (if exists)
    let group = '';
    if (columnKeys.length >= 4 && row[columnKeys[3]]) {
      group = String(row[columnKeys[3]]).trim();
    }

    // Get side from fifth column (if exists)
    let side: 'חתן' | 'כלה' | 'משותף' = 'משותף';
    if (columnKeys.length >= 5 && row[columnKeys[4]]) {
      const value = String(row[columnKeys[4]]).toLowerCase();
      if (value.includes('חתן')) {
        side = 'חתן';
      } else if (value.includes('כלה')) {
        side = 'כלה';
      }
    }

    // Look for notes in remaining columns (if any)
    let notes = '';
    for (let i = 5; i < columnKeys.length; i++) {
      if (row[columnKeys[i]]) {
        notes = String(row[columnKeys[i]]).trim();
        break; // Take first non-empty column as notes
      }
    }
    
    console.log(`Processing guest: "${guestName}" - ${numberOfGuests} guests, phone: ${phoneNumber}, group: ${group}, side: ${side}`);

    return {
      userId,
      name: guestName,
      phoneNumber,
      numberOfGuests,
      side,
      isConfirmed: null,
      notes,
      group,
      ...(sharedEventId && { sharedEventId })
    };
  }

  private processPhoneNumber(phone: string): string {
    const cleanedPhone = phone.replace(/[^\d+-]/g, '');
    
    if (/^\d{3}-\d{7}$/.test(cleanedPhone) || /^\d{2}-\d{7}$/.test(cleanedPhone)) {
      return cleanedPhone;
    }
    
    const digitsOnly = cleanedPhone.replace(/\D/g, '');
    
    if (digitsOnly.length === 10 && digitsOnly.startsWith('05')) {
      return `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3)}`;
    } else if (digitsOnly.length === 9 && (digitsOnly.startsWith('5') || digitsOnly.startsWith('9'))) {
      return `0${digitsOnly.substring(0, 2)}-${digitsOnly.substring(2)}`;
    }
    
    return digitsOnly;
  }

  private async removeExampleGuests(guestList: Guest[]): Promise<Guest[]> {
    if (!Array.isArray(guestList)) {
      return [];
    }

    const exampleNames = ['ישראל ישראלי', 'שרה לוי', 'משפחת כהן'];
    const exampleKeywords = ['דוגמא', 'דוגמה', 'Example', 'מיכל לוי', 'Israeli', 'Israel', 'template'];
    
    const exampleGuests = guestList.filter(guest => {
      if (exampleNames.includes(guest.name)) return true;
      if (guest.notes === 'דוגמה להערה' || guest.notes === 'חברים משותפים') return true;
      
      const nameLowercase = guest.name.toLowerCase();
      for (const keyword of exampleKeywords) {
        if (guest.name.includes(keyword) || nameLowercase.includes(keyword.toLowerCase())) {
          return true;
        }
      }
      
      return false;
    });
    
    if (exampleGuests.length > 0) {
      console.log(`Removing ${exampleGuests.length} example guests...`);
      
      const updatedList = [...guestList];
      
      for (const guest of exampleGuests) {
        try {
          await this.deleteGuest(guest._id);
          const index = updatedList.findIndex(g => g._id === guest._id);
          if (index !== -1) updatedList.splice(index, 1);
        } catch (error) {
          console.error(`Error deleting example guest ${guest.name}:`, error);
        }
      }
      
      return updatedList;
    }
    
    return guestList;
  }

  downloadTemplate(): void {
    const templateData = [
      {
        'שם': 'ישראל ישראלי',
        'טלפון': '050-1234567',
        'מספר אורחים': 2,
        'צד': 'חתן',
        'קבוצה': 'משפחה',
        'אישור הגעה': '',
        'הערות': 'דוגמה להערה'
      },
      {
        'שם': 'שרה לוי',
        'טלפון': '052-9876543',
        'מספר אורחים': 1,
        'צד': 'כלה',
        'קבוצה': 'חברים',
        'אישור הגעה': '',
        'הערות': ''
      },
      {
        'שם': 'משפחת כהן',
        'טלפון': '054-5551234',
        'מספר אורחים': 4,
        'צד': 'משותף',
        'קבוצה': 'עבודה',
        'אישור הגעה': '',
        'הערות': 'חברים משותפים'
      },
      {
        'שם': 'זוג רוזנברג',
        'טלפון': '053-1112233',
        'מספר אורחים': 'זוג',
        'צד': 'חתן',
        'קבוצה': 'שכונה',
        'אישור הגעה': '',
        'הערות': 'דוגמה לזוג'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    XLSX.utils.sheet_add_aoa(ws, [
      ['תבנית לייבוא רשימת אורחים'],
      ['הוראות:'],
      ['1. מלא את הפרטים בטבלה מתחת לכותרות'],
      ['2. עמודת "שם" היא חובה, שאר העמודות אופציונליות'],
      ['3. עבור "צד" ניתן לרשום: חתן, כלה, או משותף'],
      ['4. עבור "מספר אורחים" ניתן לרשום: מספר (1,2,3...), "זוג", "משפחה", "יחיד"'],
      ['5. עבור "קבוצה" ניתן לרשום: משפחה, עבודה, חברים, צבא, לימודים, שכונה'],
      ['6. עבור "אישור הגעה" ניתן לרשום: כן, לא, או להשאיר ריק'],
      ['']
    ], { origin: 'A1' });

    const wscols = [
      { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, 
      { wch: 12 }, { wch: 10 }, { wch: 30 }
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'רשימת אורחים');

    XLSX.writeFile(wb, 'תבנית_רשימת_אורחים.xlsx');
  }
}

export const guestService = new GuestService(); 