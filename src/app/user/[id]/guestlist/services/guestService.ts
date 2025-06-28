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

  async importGuests(file: File, userId: string, sharedEventId?: string): Promise<{ 
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

          // Process each row
          for (const row of filteredRows) {
            try {
              const processed = this.processExcelRow(row as Record<string, any>, userId, sharedEventId);
              
              if (!processed) {
                errorCount++;
                missingNameCount++;
                continue;
              }

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
              }
            } catch (error) {
              console.error('Error processing row:', error, row);
              errorCount++;
              otherErrorCount++;
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
    
    // Find name column
    let nameColumn = this.findColumn(columnKeys, ['שם המוזמן', 'שם', 'name']);
    if (!nameColumn && columnKeys.length > 0) {
      nameColumn = columnKeys[0];
    }
    
    const guestName = String(row[nameColumn] || '').trim();
    if (!guestName) {
      return null;
    }

    // Find other columns
    const phoneColumn = this.findColumn(columnKeys, ['ניוד', 'טלפון', 'phone', 'נייד']);
    const guestsColumn = this.findColumn(columnKeys, ['מספר מוזמנים', 'מספר אורחים', 'כמות']);
    const sideColumn = this.findColumn(columnKeys, ['מתאם של...', 'צד', 'שיוך']);
    const groupColumn = this.findColumn(columnKeys, ['קבוצה', 'group', 'סוג']);
    const notesColumn = this.findColumn(columnKeys, ['הערות', 'notes']);

    // Process phone number
    let phoneNumber = '';
    if (phoneColumn && row[phoneColumn]) {
      phoneNumber = this.processPhoneNumber(String(row[phoneColumn]));
    }

    // Process number of guests
    let numberOfGuests = 1;
    if (guestsColumn && row[guestsColumn]) {
      const value = row[guestsColumn];
      if (typeof value === 'number') {
        numberOfGuests = Math.max(0, Math.round(value));
      } else if (typeof value === 'string') {
        const parsed = parseInt(value.replace(/[^\d]/g, ''));
        if (!isNaN(parsed)) {
          numberOfGuests = Math.max(0, parsed);
        }
      }
    }

    // Determine side
    let side: 'חתן' | 'כלה' | 'משותף' = 'משותף';
    if (sideColumn && row[sideColumn]) {
      const value = String(row[sideColumn]).toLowerCase();
      if (value.includes('חתן')) {
        side = 'חתן';
      } else if (value.includes('כלה')) {
        side = 'כלה';
      }
    }

    // Process group
    let group = '';
    if (groupColumn && row[groupColumn]) {
      group = String(row[groupColumn]).trim();
    }

    // Process notes
    const notes = notesColumn ? String(row[notesColumn] || '') : '';

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

  private findColumn(columnKeys: string[], keywords: string[]): string | null {
    for (const key of columnKeys) {
      const normalizedKey = key.toLowerCase().trim();
      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().trim();
        if (normalizedKey === normalizedKeyword || normalizedKey.includes(normalizedKeyword)) {
          return key;
        }
      }
    }
    return null;
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
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    XLSX.utils.sheet_add_aoa(ws, [
      ['תבנית לייבוא רשימת אורחים'],
      ['הוראות:'],
      ['1. מלא את הפרטים בטבלה מתחת לכותרות'],
      ['2. עמודת "שם" היא חובה, שאר העמודות אופציונליות'],
      ['3. עבור "צד" ניתן לרשום: חתן, כלה, או משותף'],
      ['4. עבור "קבוצה" ניתן לרשום: משפחה, עבודה, חברים, צבא, לימודים, שכונה (או להשאיר ריק)'],
      ['5. עבור "אישור הגעה" ניתן לרשום: כן, לא, או להשאיר ריק'],
      ['']
    ], { origin: 'A1' });

    const wscols = [
      { wch: 20 }, { wch: 15 }, { wch: 8 }, { wch: 10 }, 
      { wch: 12 }, { wch: 10 }, { wch: 30 }
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'רשימת אורחים');

    XLSX.writeFile(wb, 'תבנית_רשימת_אורחים.xlsx');
  }
}

export const guestService = new GuestService(); 