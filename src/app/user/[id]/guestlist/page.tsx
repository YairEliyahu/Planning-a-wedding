'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Head from 'next/head';
import * as XLSX from 'xlsx';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Guest {
  _id: string;
  name: string;
  phoneNumber?: string;
  numberOfGuests: number;
  side: 'חתן' | 'כלה' | 'משותף';
  isConfirmed: boolean | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  sharedEventId?: string;
}

type NewGuest = Omit<Guest, '_id' | 'createdAt' | 'updatedAt'>;

// קאש לנתונים - מונע בקשות חוזרות
const dataCache = new Map();

export default function GuestlistPage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState<NewGuest>({
    name: '',
    phoneNumber: '',
    numberOfGuests: 0,
    side: 'משותף',
    isConfirmed: null,
    notes: ''
  });
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');
  const [sideFilter, setSideFilter] = useState<'all' | 'חתן' | 'כלה' | 'משותף'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ 
    success: number, 
    error: number,
    errorDetails?: {
      missingName?: number,
      invalidPhone?: number, 
      apiErrors?: number,
      otherErrors?: number
    } 
  } | null>(null);
  const [showImportStatus, setShowImportStatus] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number, total: number, currentName: string }>({ current: 0, total: 0, currentName: '' });
  const [importOverlay, setImportOverlay] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // שינוי מ-10 ל-50

  // First define filteredGuests
  const filteredGuests = useMemo(() => {
    // existing filtering logic
    return guests && Array.isArray(guests) ? guests
      .filter(guest => {
        console.log('Filtering guest:', guest);
        
        // סינון לפי סטטוס
        if (filter === 'confirmed' && guest.isConfirmed !== true) return false;
        if (filter === 'declined' && guest.isConfirmed !== false) return false;
        if (filter === 'pending' && guest.isConfirmed !== null) return false;

        // סינון לפי צד
        if (sideFilter !== 'all' && guest.side !== sideFilter) return false;

        // סינון לפי חיפוש
        if (searchQuery && !guest.name.includes(searchQuery) && !guest.phoneNumber?.includes(searchQuery)) return false;

        return true;
      }) : [];
  }, [guests, filter, sideFilter, searchQuery]);

  // Then define the pagination variables
  const paginatedGuests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGuests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGuests, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredGuests.length / itemsPerPage);
  }, [filteredGuests, itemsPerPage]);

  // פונקציה שמחזירה נתונים מהקאש או מבצעת בקשה חדשה
  const fetchWithCache = async (url: string, cacheKey: string) => {
    if (dataCache.has(cacheKey)) {
      console.log(`Using cached data for ${cacheKey}`);
      return dataCache.get(cacheKey);
    }
    
    console.log(`Fetching fresh data for ${cacheKey}`);
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`API error for ${url}:`, errorData);
      throw new Error(errorData.message || `Failed to fetch ${url}`);
    }
    
    const data = await response.json();
    
    // רק מאחסן בקאש אם התקבלו נתונים תקינים
    dataCache.set(cacheKey, data);
    
    return data;
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!user) {
        router.push('/login');
        return;
      }

      if (user._id !== params.id) {
        router.push(`/user/${user._id}/guestlist`);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        await Promise.all([
          fetchGuestlist(),
          fetchUserProfile()
        ]);
      } catch (err: Error | unknown) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'אירעה שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);
  
  // אפקט נוסף לניקוי אורחי דוגמה שהתווספו
  useEffect(() => {
    const cleanupExampleGuests = async () => {
      if (guests.length > 0) {
        const updatedGuests = await removeExampleGuests([...guests]);
        if (updatedGuests.length !== guests.length) {
          setGuests(updatedGuests);
        }
      }
    };
    
    cleanupExampleGuests();
  }, [guests.length]);

  // הוסף useEffect לבדוק את מצב הרינדור
  useEffect(() => {
    console.log('Component rendered with guests:', guests.length);
  }, [guests]);

  // רענון אוטומטי של רשימת המוזמנים אם המשתמש מחובר למשתמש אחר
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user && user.connectedUserId) {
      console.log(`User has connected account ${user.connectedUserId}, setting up auto-refresh`);
      let autoRefreshInterval: NodeJS.Timeout;

      // רענון ראשוני
      const initialDelay = setTimeout(() => {
        console.log('Initial refresh of guest list for connected accounts');
        dataCache.clear(); // ניקוי מטמון
        fetchGuestlist();

        // רענון כל 15 שניות במקום 30 - תדירות גבוהה יותר עבור חשבונות מקושרים
        autoRefreshInterval = setInterval(() => {
          console.log('Auto-refreshing guest list for connected accounts...');
          // ניקוי המטמון לפני הרענון כדי לקבל תמיד את הנתונים העדכניים ביותר
          dataCache.clear();
          fetchGuestlist();
        }, 15000); // 15 seconds refresh
      }, 1000);

      return () => {
        clearTimeout(initialDelay);
        clearInterval(autoRefreshInterval);
      };
    }
  }, [user, user?.connectedUserId, user?.sharedEventId]);

  const fetchUserProfile = async () => {
    try {
      const cacheKey = `user-${params.id}`;
      const data = await fetchWithCache(`/api/user/${params.id}`, cacheKey);
      
      if (!data.user.isProfileComplete) {
        router.push('/complete-profile');
        return;
      }

      // setProfile(data.user);
    } catch (err) {
      setError('שגיאה בטעינת פרופיל המשתמש');
      throw err;
    }
  };

  const fetchGuestlist = async () => {
    try {
      console.log(`Attempting to fetch guestlist for user: ${params.id}`);
      console.log('User connected status:', user?.connectedUserId ? `Connected to user ${user.connectedUserId}` : 'Not connected');
      console.log('SharedEventId:', user?.sharedEventId || 'None');
      
      // נקה את זיכרון המטמון לגבי רשימת המוזמנים
      const cacheKey = `guests-${params.id}`;
      dataCache.delete(cacheKey);
      
      // הוסף פרמטר timestamp כדי למנוע קאשינג בדפדפן
      const timestamp = new Date().getTime();
      const forceSyncParam = user?.connectedUserId ? 'forceSync=true' : '';
      const response = await fetch(`/api/guests?userId=${params.id}&t=${timestamp}&${forceSyncParam}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response structure:', JSON.stringify(data, null, 2));
      
      // בדיקת מבנה הנתונים החוזרים
      if (!data || !data.guests) {
        console.error('Invalid API response:', data);
        setGuests([]);
        return;
      }
      
      // בדיקה אם guests הוא מערך ישירות או מבנה מורכב יותר
      let fetchedGuests = [];
      
      if (Array.isArray(data.guests)) {
        // אם זה מערך ישיר
        fetchedGuests = data.guests;
        console.log('Guests are in array format:', fetchedGuests.length);
      } else if (data.guests.sides) {
        // אם זה מבנה מורכב עם צדדים
        fetchedGuests = [
          ...data.guests.sides['חתן'],
          ...data.guests.sides['כלה'],
          ...data.guests.sides['משותף']
        ];
        console.log('Combined guests from sides:', fetchedGuests.length);
      } else {
        console.error('Unexpected guests format:', data.guests);
      }
      
      if (fetchedGuests.length > 0) {
        console.log('First guest in list:', fetchedGuests[0]);
      }
      
      // הסרת אורחי דוגמה אם קיימים
      const cleanedGuests = await removeExampleGuests([...fetchedGuests]);
      
      console.log('Setting guests state with:', cleanedGuests.length, 'guests');
      if (cleanedGuests.length > 0) {
        console.log('Example guest:', cleanedGuests[0]);
      }
      setGuests(cleanedGuests);
    } catch (error) {
      console.error('Error in fetchGuestlist:', error);
      setError('שגיאה בטעינת רשימת האורחים');
      setGuests([]);
    }
  };
  
  // פונקציה למחיקת אורחי דוגמה אוטומטית
  const removeExampleGuests = async (guestList: Guest[]) => {
    // וידוא שהנתונים הם אכן מערך 
    if (!Array.isArray(guestList)) {
      console.error('guestList is not an array:', guestList);
      return [];
    }
    
    console.log('Before removing examples, guest count:', guestList.length);
    
    // שמות של אורחי דוגמה מוכרים
    const exampleNames = ['ישראל ישראלי', 'שרה לוי', 'משפחת כהן'];
    const exampleKeywords = ['דוגמא', 'דוגמה', 'Example', 'מיכל לוי', 'Israeli', 'Israel', 'template'];
    
    // מציאת אורחי הדוגמה
    const exampleGuests = guestList.filter(guest => {
      // בדיקה לשמות מדויקים
      if (exampleNames.includes(guest.name)) return true;
      
      // בדיקה להערות מיוחדות
      if (guest.notes === 'דוגמה להערה' || guest.notes === 'חברים משותפים') return true;
      
      // בדיקה לתוכן שם שמכיל מילות מפתח של דוגמאות
      const nameLowercase = guest.name.toLowerCase();
      for (const keyword of exampleKeywords) {
        if (guest.name.includes(keyword) || nameLowercase.includes(keyword.toLowerCase())) {
          return true;
        }
      }
      
      return false;
    });
    
    // אם יש אורחי דוגמה, נמחק אותם
    if (exampleGuests.length > 0) {
      console.log(`מוחק ${exampleGuests.length} אורחי דוגמה...`);
      
      // מחיקת כל אורח דוגמה מ-API ומהרשימה המקומית
      const updatedList = [...guestList];
      
      for (const guest of exampleGuests) {
        try {
          // מחיקה ישירה מה-API, ללא אישור משתמש
          const response = await fetch(`/api/guests/${guest._id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete example guest');
          }
          
          // הסרת האורח מהרשימה המקומית
          const index = updatedList.findIndex(g => g._id === guest._id);
          if (index !== -1) updatedList.splice(index, 1);
        } catch (error) {
          console.error(`שגיאה במחיקת אורח דוגמה ${guest.name}:`, error);
        }
      }
      
      // החזרת הרשימה המעודכנת
      return updatedList;
    }
    
    // אם אין אורחי דוגמה, החזר את הרשימה המקורית
    return guestList;
  };

  const handleAddGuest = async () => {
    console.log('*** התחלת פונקציית הוספת אורח ***');
    console.log('מצב newGuest:', newGuest);
  
    try {
      if (!newGuest.name.trim()) {
        alert('נא להזין שם אורח');
        return;
      }
  
      // הכנת אובייקט עם טיפוס נכון
      const guestData: {
        userId: string;
        name: string;
        phoneNumber?: string;
        numberOfGuests: number;
        side: 'חתן' | 'כלה' | 'משותף';
        isConfirmed: boolean | null;
        notes: string;
        sharedEventId?: string;
      } = {
        ...newGuest,
        userId: params.id,
        numberOfGuests: parseInt(String(newGuest.numberOfGuests)) || 1,
      };
      
      // אם המשתמש מחובר לשותף, נוסיף את מזהה האירוע המשותף
      if (user?.sharedEventId) {
        console.log('Adding shared event ID to new guest:', user.sharedEventId);
        guestData.sharedEventId = user.sharedEventId;
      }
  
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // מניעת קאשינג
        },
        body: JSON.stringify(guestData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`שגיאה בהוספת אורח - קוד ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
  
      if (data && data.guest) {
        console.log('התקבל אורח חדש מהשרת:', data.guest);
  
        // הוספה מיידית לסטייט
        setGuests(prevGuests => [...prevGuests, data.guest]);
  
        // איפוס הטופס
        setNewGuest({
          name: '',
          phoneNumber: '',
          numberOfGuests: 0,
          side: 'משותף',
          isConfirmed: null,
          notes: '',
        });
  
        // רענון ברקע אחרי שניה - ניקוי המטמון לקבלת נתונים טריים
        setTimeout(() => {
          console.log('Refreshing guest list after adding new guest');
          dataCache.clear();
          fetchGuestlist();
          
          // אם יש משתמש מקושר, חכה עוד שנייה ורענן שוב לוודא שכל המידע מסונכרן
          if (user?.connectedUserId) {
            setTimeout(() => {
              console.log('Second refresh to ensure sync with connected account');
              dataCache.clear();
              fetchGuestlist();
            }, 2000);
          }
        }, 1000);
      } else {
        throw new Error('לא התקבל אורח תקין מהשרת');
      }
    } catch (error) {
      console.error('שגיאה בהוספת אורח:', error);
      alert(`שגיאה בהוספת אורח: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
    }
  };
  

  const handleEditGuest = async (guest: Guest) => {
    try {
      if (editingGuestId === guest._id) {
        // הוספת sharedEventId אם המשתמש מחובר למשתמש אחר
        if (user?.sharedEventId && !guest.sharedEventId) {
          guest.sharedEventId = user.sharedEventId;
          console.log('Adding shared event ID to edited guest:', user.sharedEventId);
        }
        
        // Call the API to update the guest
        console.log('Sending update for guest:', guest);
        const response = await fetch(`/api/guests/${guest._id}`, {
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
        
        // Update the guest in the state
        setGuests(prevGuests => 
          prevGuests.map(g => g._id === guest._id ? data.guest : g)
        );
        
        // רענון מלא מהשרת אחרי עדכון - חשוב לסנכרון
        // נקה את המטמון לפני כדי לקבל נתונים טריים
        dataCache.clear();
        await fetchGuestlist();
        
        // Reset the editing state
        setEditingGuestId(null);
        
        // אם יש משתמש מקושר, חכה שנייה ורענן שוב לוודא שכל העדכונים הגיעו
        if (user?.connectedUserId) {
          setTimeout(() => {
            console.log('Refreshing after edit to ensure sync with connected account');
            dataCache.clear();
            fetchGuestlist();
          }, 2000);
        }
      } else {
        // Set this guest as the one being edited
        setEditingGuestId(guest._id);
      }
    } catch (error) {
      console.error('Error editing guest:', error);
      alert('Error editing guest: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק אורח זה?')) {
      try {
        // Call the API to delete the guest
        const response = await fetch(`/api/guests/${guestId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete guest');
        }
        
        // Remove the guest from the state
        setGuests(guests.filter(guest => guest._id !== guestId));
      } catch (error) {
        console.error('Failed to delete guest:', error);
        alert('Failed to delete guest. Please try again.');
      }
    }
  };

  const handleConfirmGuest = async (guestId: string, status: boolean | null) => {
    try {
      // Find the guest to update
      const guestToUpdate = guests.find(guest => guest._id === guestId);
      if (!guestToUpdate) return;
      
      // Create updated guest with new status
      const updatedGuest = { ...guestToUpdate, isConfirmed: status };
      
      // Call the API to update the guest
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGuest),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update guest status');
      }
      
      // Update the guest in the state
      setGuests(guests.map(guest => 
        guest._id === guestId ? { ...guest, isConfirmed: status } : guest
      ));
    } catch (error) {
      console.error('Failed to update guest status:', error);
      alert('Failed to update guest status. Please try again.');
    }
  };

  const getGuestStats = () => {
    const confirmed = guests.filter(guest => guest.isConfirmed === true);
    const declined = guests.filter(guest => guest.isConfirmed === false);
    const pending = guests.filter(guest => guest.isConfirmed === null);
    
    const totalGuests = guests.reduce((sum, guest) => sum + guest.numberOfGuests, 0);
    const confirmedGuests = confirmed.reduce((sum, guest) => sum + guest.numberOfGuests, 0);
    
    return {
      totalCount: guests.length,
      confirmedCount: confirmed.length,
      declinedCount: declined.length,
      pendingCount: pending.length,
      totalGuests,
      confirmedGuests
    };
  };

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);
    setImportOverlay(true);
    setImportProgress({ current: 0, total: 0, currentName: '' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // נניח שהגיליון הראשון מכיל את הנתונים
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // המרה למערך של אובייקטים
        interface ExcelGuestRow {
          [key: string]: string | number | boolean | null | undefined;
        }
        
        // במידה ויש שורות ריקות או כותרות, יש לדלג עליהן
        const rows = XLSX.utils.sheet_to_json<ExcelGuestRow>(worksheet, { 
          defval: '',  // ערך ברירת מחדל לתאים ריקים
          raw: false,  // להמיר מספרים למחרוזות
          header: 'A' // להשתמש בשמות עמודות מקוריים אם אין כותרות
        });
        
        console.log('Raw Excel data:', rows);
        
        // הסרת שורות ריקות או כותרות
        const filteredRows = rows.filter(row => {
          // בדיקה אם זו שורת כותרת
          const isHeader = Object.values(row).some(val => 
            typeof val === 'string' && 
            (val.includes('מוזמנים') || val.includes('מאושרות') || val.includes('שם המוזמן'))
          );
          
          // בדיקה אם זו שורה ריקה
          const isEmpty = Object.values(row).every(val => val === '' || val === null || val === undefined);
          
          // בדיקה אם זו שורת דוגמה מהתבנית
          const isExample = Object.values(row).some(val => 
            typeof val === 'string' && 
            (val.includes('ישראל ישראלי') || val.includes('דוגמה להערה') || val.includes('שרה לוי'))
          );
          
          // לסנן שורות כותרת, שורות ריקות ושורות דוגמה
          return !isHeader && !isEmpty && !isExample;
        });
        
        console.log('Filtered rows:', filteredRows);
        
        // אם אין שורות תקפות
        if (filteredRows.length === 0) {
          console.error('No valid rows found in Excel file');
          setImportStatus({ 
            success: 0, 
            error: 1,
            errorDetails: {
              missingName: 0,
              invalidPhone: 0,
              apiErrors: 0,
              otherErrors: 1
            }
          });
          setImportOverlay(false);
          setIsImporting(false);
          setShowImportStatus(true);
          return;
        }

        // עדכון הקידמה הכללית
        setImportProgress(prev => ({ ...prev, total: filteredRows.length }));
        
        // זיהוי שמות העמודות בקובץ
        const sampleRow = filteredRows[0];
        const columnKeys = Object.keys(sampleRow || {});
        
        // רשימת העמודות בקובץ האקסל שהמשתמש העלה
        console.log('Available columns in Excel file:', columnKeys);
        
        // פונקציה לזיהוי עמודה לפי מילות מפתח
        const findColumn = (keywords: string[]): string | null => {
          // בדיקה ישירה של המילות מפתח
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
        };
        
        // זיהוי העמודות - ניסיון ספציפי למבנה שראינו
        let nameColumn = findColumn(['שם המוזמן', 'שם', 'name']) || columnKeys.find(c => c.includes('מוזמן') || c.includes('שם')) || '';
        const phoneColumn = findColumn(['ניוד', 'טלפון', 'phone', 'נייד', 'הסבר קצר']) || columnKeys.find(c => /ני[יו]ד/.test(c)) || '';
        let guestsColumn = findColumn(['מספר מוזמנים', 'מספר אורחים', 'כמות', 'guests', 'count']) || columnKeys.find(c => c.includes('מספר') || c.includes('כמות')) || '';
        const sideColumn = findColumn(['מתאם של...', 'צד', 'שיוך']) || columnKeys.find(c => c.includes('מתאם') || c.includes('שיוך')) || '';
        const relationColumn = findColumn(['שיוך להזמנה', 'שיוך']) || '';
        const notesColumn = findColumn(['הערות (כולל הופעי)', 'הערות', 'notes']) || '';
        
        console.log('Identified columns:', { 
          nameColumn, 
          phoneColumn, 
          guestsColumn, 
          sideColumn, 
          notesColumn,
          relationColumn 
        });
        
        // אם לא זוהתה עמודת שם, ננסה להשתמש בעמודה הראשונה
        if (!nameColumn && columnKeys.length > 0) {
          console.warn('Name column not identified, using first column:', columnKeys[0]);
          nameColumn = columnKeys[0];
        }
        
        // ניתוח הנתונים בקובץ לזיהוי עמודת מספר המוזמנים לפי המאפיינים שלה
        const analyzeNumericColumns = () => {
          // מועמדים פוטנציאליים לעמודת מספר מוזמנים
          const potentialGuestCountColumns: { column: string, numericRatio: number, avgValue: number }[] = [];
          
          // עבור כל עמודה
          for (const column of columnKeys) {
            // דילוג על עמודות שכבר זיהינו
            if (column === nameColumn || column === phoneColumn || 
                column === notesColumn || column === sideColumn || 
                column === relationColumn) continue;
            
            let numericCount = 0;
            let totalCount = 0;
            let sum = 0;
            let validRows = 0;
            
            // בדיקת השורות בעמודה
            for (const row of filteredRows) {
              const value = row[column];
              
              if (value !== undefined && value !== '') {
                totalCount++;
                
                // אם זה מספר ישיר
                if (typeof value === 'number') {
                  if (value >= 1 && value <= 20) { // מספר הגיוני של אורחים
                    numericCount++;
                    sum += value;
                    validRows++;
                  }
                } 
                // אם זה מחרוזת שניתן להמיר למספר
                else if (typeof value === 'string') {
                  const cleanValue = value.replace(/[^\d]/g, '');
                  if (cleanValue) {
                    const num = parseInt(cleanValue);
                    if (!isNaN(num) && num >= 1 && num <= 20) {
                      numericCount++;
                      sum += num;
                      validRows++;
                    }
                  }
                }
              }
            }
            
            // חישוב אחוז הערכים המספריים בעמודה
            const numericRatio = totalCount > 0 ? numericCount / totalCount : 0;
            // חישוב ממוצע הערכים
            const avgValue = validRows > 0 ? sum / validRows : 0;
            
            if (numericRatio > 0.5 && avgValue >= 1) { // אם יותר ממחצית הערכים הם מספרים וממוצע סביר
              potentialGuestCountColumns.push({
                column,
                numericRatio,
                avgValue
              });
              console.log(`Potential guest count column: ${column}, numeric ratio: ${numericRatio.toFixed(2)}, avg value: ${avgValue.toFixed(2)}`);
            }
          }
          
          // מיון המועמדים לפי רלוונטיות
          potentialGuestCountColumns.sort((a, b) => {
            // העדפה ראשונה: עמודות עם שם רלוונטי
            const aNameRelevance = a.column.includes('מוזמנים') || a.column.includes('כמות') || a.column.includes('מספר') ? 1 : 0;
            const bNameRelevance = b.column.includes('מוזמנים') || b.column.includes('כמות') || b.column.includes('מספר') ? 1 : 0;
            
            if (aNameRelevance !== bNameRelevance) return bNameRelevance - aNameRelevance;
            
            // העדפה שנייה: אחוז גבוה יותר של מספרים
            if (Math.abs(a.numericRatio - b.numericRatio) > 0.1) return b.numericRatio - a.numericRatio;
            
            // העדפה שלישית: ממוצע ערכים הגיוני יותר למספר מוזמנים (בין 1 ל-5)
            const aAvgDeviation = Math.abs(a.avgValue - 2.5);
            const bAvgDeviation = Math.abs(b.avgValue - 2.5);
            return aAvgDeviation - bAvgDeviation;
          });
          
          return potentialGuestCountColumns.length > 0 ? potentialGuestCountColumns[0].column : null;
        };
        
        // אם לא זיהינו עמודת מספר מוזמנים לפי השם, ננסה לזהות לפי הנתונים
        let detectedGuestsColumn = null;
        if (!guestsColumn) {
          detectedGuestsColumn = analyzeNumericColumns();
          if (detectedGuestsColumn) {
            console.log(`Detected guests column by data analysis: ${detectedGuestsColumn}`);
            guestsColumn = detectedGuestsColumn;
          }
        }
        
        // מונים להצלחות וכשלונות
        let successCount = 0;
        let errorCount = 0;
        // מונים לסוגי שגיאות
        let missingNameCount = 0;
        let invalidPhoneCount = 0;
        let apiErrorCount = 0;
        let otherErrorCount = 0;
        
        // עיבוד כל שורה
        for (const row of filteredRows) {
          try {
            // שם האורח - חובה
            const guestName = String(row[nameColumn] || '').trim();
            if (!guestName) {
              console.log('Skipping row - no name found', row);
              errorCount++;
              missingNameCount++;
              continue;
            }
            
            // מספר אורחים - שלב 1: בדיקת עמודת מספר מוזמנים
            let numberOfGuestsFromColumn = 1;
            if (guestsColumn) {
              // ניסיון פרסור מספר באופנים שונים
              const guestValue = row[guestsColumn];
              console.log('Guest number raw value:', guestValue, 'type:', typeof guestValue);
              
              if (guestValue !== undefined && guestValue !== '') {
                // אם זה מספר
                if (typeof guestValue === 'number') {
                  // אפשר גם 0 מוזמנים
                  numberOfGuestsFromColumn = guestValue >= 0 ? Math.round(guestValue) : 1;
                } 
                // אם זה מחרוזת - בדיקה אם מציין זוג
                else if (typeof guestValue === 'string') {
                  const strValue = String(guestValue).trim().toLowerCase();
                  // אם מציין זוג
                  if (strValue === 'כן' || strValue === 'yes' || strValue === 'true' || 
                      strValue.includes('זוג') || strValue.includes('+')) {
                    numberOfGuestsFromColumn = 2;
                    console.log('Found couple indication, setting to 2 guests');
                  } else {
                    // ניקוי טקסט והמרה למספר
                    const cleanedValue = String(guestValue).replace(/[^\d]/g, '');
                    const parsedGuests = parseInt(cleanedValue);
                    if (!isNaN(parsedGuests) && parsedGuests >= 0) {  // שינוי כאן לתמיכה ב-0
                      numberOfGuestsFromColumn = parsedGuests;
                    }
                  }
                }
              }
            }
            
            // בדיקה בעמודות נוספות שעשויות להכיל מספרים
            if (numberOfGuestsFromColumn === 1) {
              // בדיקת עמודות מספריות אחרות
              for (const key of columnKeys) {
                if (key !== guestsColumn && key !== nameColumn && key !== phoneColumn && 
                    key !== sideColumn && key !== notesColumn) {
                  const value = row[key];
                  if (value !== undefined && value !== '') {
                    let parsedValue = 0;
                    
                    if (typeof value === 'number') {
                      parsedValue = Math.round(value);
                    } else if (typeof value === 'string') {
                      const cleanedValue = String(value).replace(/[^\d]/g, '');
                      parsedValue = parseInt(cleanedValue);
                    }
                    
                    // אם מצאנו מספר הגיוני של מוזמנים (כולל 0)
                    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 20) {
                      numberOfGuestsFromColumn = parsedValue;
                      console.log('Found guest count in column:', key, 'value:', parsedValue);
                      break;
                    }
                  }
                }
              }
            }
            
            // מספר אורחים - שלב 2: ניתוח לפי שם האורח
            let numberOfGuestsFromName = 1;
            
            // בדיקה של שם האורח אם מציין זוג או משפחה
            if (guestName) {
              // בדיקת ציון זוג בשם
              if (guestName.includes(' ו') || guestName.includes(' +') || 
                  guestName.includes('+') || guestName.includes(' and ') || 
                  guestName.includes('&')) {
                numberOfGuestsFromName = 2;
                console.log('Guest name suggests a couple:', guestName, 'setting to 2 guests');
              }
              
              // בדיקת אם מדובר במשפחה
              if (guestName.includes('משפחת') || guestName.includes('משפ\'') || 
                  guestName.includes('family') || guestName.includes('הורי') || 
                  guestName.includes('ילדי') || guestName.includes('וילדיהם')) {
                // אם זה משפחה, נגדיר לפחות 3 אנשים אם לא מצוין אחרת
                numberOfGuestsFromName = Math.max(numberOfGuestsFromName, 3);
                console.log('Guest name suggests a family:', guestName, 'setting to at least 3 guests');
              }
            }
            
            // שלב 3: בחירת המספר הגבוה יותר בין שתי השיטות
            // אבל אם יש עמודה מספרית מובהקת, נעדיף אותה על פני ניתוח השם
            const preferColumnValue = detectedGuestsColumn !== null;
            
            // שלב 3: בחירת המספר המוזמנים הסופי
            // האלגוריתם המעודכן: אם הערך מהעמודה הוא 0, נשתמש ב-0
            // אחרת, אם מקור העמודה מובהק, נשתמש בו; אחרת, ניקח את המקסימום
            let numberOfGuests = 1;
            
            if (numberOfGuestsFromColumn === 0) {
              // אם הערך מהעמודה הוא 0, נשתמש ב-0 גם אם ניתוח השם אומר אחרת
              numberOfGuests = 0;
            } else if (preferColumnValue) {
              // אם יש עמודה מספרית מובהקת, נעדיף אותה על פני ניתוח השם
              numberOfGuests = numberOfGuestsFromColumn;
            } else {
              // אחרת, ניקח את הערך הגבוה ביותר מהעמודה או מניתוח השם
              numberOfGuests = Math.max(numberOfGuestsFromColumn, numberOfGuestsFromName);
            }
            
            console.log('Final guest count decision:', {
              name: guestName,
              fromColumn: numberOfGuestsFromColumn,
              fromName: numberOfGuestsFromName,
              preferColumnValue: preferColumnValue,
              final: numberOfGuests
            });
            
            // טלפון (אופציונלי)
            let phoneNumber = '';
            
            // ניסיון פרסור טלפון
            if (phoneColumn && row[phoneColumn] !== undefined) {
              phoneNumber = String(row[phoneColumn] || '').trim();
              
              // שמירה על מקפים בפורמט של טלפונים
              // ניקוי רק תווים שאינם ספרות, מקפים, או סימני פלוס
              if (phoneNumber) {
                // בדיקה אם יש מקפים במיקום נכון לפורמט ישראלי
                const cleanedPhone = phoneNumber.replace(/[^\d+-]/g, '');
                // שמירה על פורמט מקפים סטנדרטי אם אפשר
                if (/^\d{3}-\d{7}$/.test(cleanedPhone) || /^\d{2}-\d{7}$/.test(cleanedPhone)) {
                  // הפורמט תקין עם מקף, נשמור עליו
                  phoneNumber = cleanedPhone;
                } else {
                  // אם אין פורמט תקין, נסיר את כל התווים שאינם ספרות
                  const digitsOnly = cleanedPhone.replace(/\D/g, '');
                  
                  // בדיקה האם יש מספיק ספרות לטלפון ישראלי תקין
                  if (digitsOnly.length < 9) {
                    console.log(`מספר טלפון לא תקין: ${phoneNumber}, נשארו רק ${digitsOnly.length} ספרות`);
                    invalidPhoneCount++;
                  }
                  
                  // אם יש 10 ספרות ומתחיל ב-05, נפרמט כ-XXX-XXXXXXX
                  if (digitsOnly.length === 10 && digitsOnly.startsWith('05')) {
                    phoneNumber = `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3)}`;
                  } else if (digitsOnly.length === 9 && (digitsOnly.startsWith('5') || digitsOnly.startsWith('9'))) {
                    // אם יש 9 ספרות ומתחיל ב-5 או 9, נוסיף 0 ונפרמט
                    phoneNumber = `0${digitsOnly.substring(0, 2)}-${digitsOnly.substring(2)}`;
                  } else {
                    // אחרת, נשאיר רק ספרות
                    phoneNumber = digitsOnly;
                  }
                }
              }
            }
            
            // אם לא נמצא טלפון בעמודה הרגילה, נחפש בכל העמודות
            if (!phoneNumber) {
              for (const key of columnKeys) {
                if (key !== phoneColumn && (
                  key.includes('טלפון') || key.includes('נייד') || 
                  key.includes('ניוד') || key.includes('phone') || 
                  key.includes('מספר') && !key.includes('מוזמנים')
                )) {
                  const potentialPhone = String(row[key] || '').trim();
                  const cleanedPhone = potentialPhone.replace(/[^\d+-]/g, '');
                  
                  // בדיקה שזה טלפון תקין (לפחות 9 ספרות)
                  if (cleanedPhone && cleanedPhone.replace(/\D/g, '').length >= 9 && /\d{9,}/.test(cleanedPhone.replace(/\D/g, ''))) {
                    // אותו טיפול כמו למעלה לפי פורמט
                    const digitsOnly = cleanedPhone.replace(/\D/g, '');
                    if (digitsOnly.length === 10 && digitsOnly.startsWith('05')) {
                      phoneNumber = `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3)}`;
                    } else if (digitsOnly.length === 9 && (digitsOnly.startsWith('5') || digitsOnly.startsWith('9'))) {
                      phoneNumber = `0${digitsOnly.substring(0, 2)}-${digitsOnly.substring(2)}`;
                    } else {
                      phoneNumber = cleanedPhone;
                    }
                    console.log('Found phone in column:', key, 'value:', phoneNumber);
                    break;
                  }
                }
              }
            }
            
            // בדיקה נוספת בכל העמודות למקרה שלא מצאנו טלפון
            if (!phoneNumber) {
              for (const key of columnKeys) {
                if (!key.includes('שם') && !key.includes('צד') && !key.includes('הערות')) {
                  const value = String(row[key] || '').trim();
                  // בדיקה אם יש ערך שנראה כמו מספר טלפון (רצף של לפחות 9 ספרות)
                  const cleanedValue = value.replace(/[^\d+-]/g, '');
                  const digitsOnly = cleanedValue.replace(/\D/g, '');
                  if (digitsOnly.length >= 9 && /\d{9,}/.test(digitsOnly)) {
                    // עיצוב מחדש של מספר הטלפון לפי הצורך
                    if (digitsOnly.length === 10 && digitsOnly.startsWith('05')) {
                      phoneNumber = `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3)}`;
                    } else if (digitsOnly.length === 9 && (digitsOnly.startsWith('5') || digitsOnly.startsWith('9'))) {
                      phoneNumber = `0${digitsOnly.substring(0, 2)}-${digitsOnly.substring(2)}`;
                    } else {
                      phoneNumber = cleanedValue;
                    }
                    console.log('Found potential phone number in column:', key, 'value:', phoneNumber);
                    break;
                  }
                }
              }
            }
            
            // קביעת צד (חתן/כלה/משותף)
            let side: 'חתן' | 'כלה' | 'משותף' = 'משותף';
            
            // בדיקה בכל העמודות לזיהוי הצד
            const sideColumns = [sideColumn, relationColumn];
            let foundSide = false;
            for (const col of sideColumns) {
              if (col && row[col]) {
                const value = String(row[col]).trim().toLowerCase();
                if (value.includes('חתן')) {
                  side = 'חתן';
                  foundSide = true;
                  break;
                } else if (value.includes('כלה')) {
                  side = 'כלה';
                  foundSide = true;
                  break;
                }
              }
            }
            
            // אם לא זוהה צד בעמודות הרגילות, נחפש בשאר העמודות
            if (!foundSide) {
              // בדיקת כל העמודות לחיפוש צד
              for (const key of columnKeys) {
                if (!sideColumns.includes(key)) {
                  const cellValue = String(row[key] || '').trim().toLowerCase();
                  
                  // בדיקה ספציפית לחתן/כלה
                  if (cellValue === 'חתן' || cellValue.includes('חתן') || 
                      cellValue.includes('גבר') || cellValue.includes('בן')) {
                    side = 'חתן';
                    console.log('Found groom side in column:', key, 'value:', cellValue);
                    foundSide = true;
                    break;
                  } else if (cellValue === 'כלה' || cellValue.includes('כלה') || 
                            cellValue.includes('אישה') || cellValue.includes('בת')) {
                    side = 'כלה';
                    console.log('Found bride side in column:', key, 'value:', cellValue);
                    foundSide = true;
                    break;
                  }
                }
              }
            }
            
            // בדיקה של שם האורח לזיהוי חתן/כלה
            if (!foundSide && guestName) {
              const lowerName = guestName.toLowerCase();
              // אם השם מכיל מילים כמו "משפחת החתן" או "הורי החתן"
              if (lowerName.includes('חתן') || lowerName.includes('אבא') || lowerName.includes('אבי')) {
                side = 'חתן';
              } else if (lowerName.includes('כלה') || lowerName.includes('אמא') || lowerName.includes('אם')) {
                side = 'כלה';
              }
            }
            
            // הערות (אופציונלי)
            const notes = notesColumn ? String(row[notesColumn] || '') : '';
            
            const guestData = {
              userId: params.id,
              name: guestName,
              phoneNumber,
              numberOfGuests,
              side,
              isConfirmed: null, // בדרך כלל אורחים מיובאים מסומנים כממתינים לאישור
              notes,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            console.log('Sending guest data:', guestData);
            
            // עדכון הקידמה הנוכחית
            setImportProgress(prev => ({ 
              current: prev.current + 1, 
              total: prev.total, 
              currentName: guestName 
            }));
            
            // שליחת הנתונים ל-API
            const response = await fetch('/api/guests', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(guestData),
            });
            
            if (response.ok) {
              successCount++;
            } else {
              const errorData = await response.json();
              console.error('API error response:', errorData);
              errorCount++;
              apiErrorCount++;
            }
          } catch (error) {
            console.error('שגיאה בייבוא שורה:', error, row);
            errorCount++;
            otherErrorCount++;
          }
        }
        
        // עדכון התוצאות
        setImportStatus({ 
          success: successCount, 
          error: errorCount,
          errorDetails: {
            missingName: missingNameCount,
            invalidPhone: invalidPhoneCount,
            apiErrors: apiErrorCount,
            otherErrors: otherErrorCount
          }
        });
        setShowImportStatus(true);
        
        // רענון רשימת האורחים
        if (successCount > 0) {
          fetchGuestlist();
        }
      } catch (error) {
        console.error('שגיאה בעיבוד קובץ Excel:', error);
        setImportStatus({ 
          success: 0, 
          error: 1,
          errorDetails: {
            missingName: 0,
            invalidPhone: 0,
            apiErrors: 0,
            otherErrors: 1
          }
        });
        setShowImportStatus(true);
      } finally {
        setImportOverlay(false);
        setIsImporting(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // איפוס שדה הקובץ כדי שניתן יהיה לבחור שוב את אותו הקובץ
    event.target.value = '';
  };

  const handleExcelTemplateDownload = () => {
    // יצירת נתוני תבנית לדוגמה
    const templateData = [
      {
        'שם': 'ישראל ישראלי',
        'טלפון': '050-1234567',
        'מספר אורחים': 2,
        'צד': 'חתן',
        'אישור הגעה': '',
        'הערות': 'דוגמה להערה'
      },
      {
        'שם': 'שרה לוי',
        'טלפון': '052-9876543',
        'מספר אורחים': 1,
        'צד': 'כלה',
        'אישור הגעה': '',
        'הערות': ''
      },
      {
        'שם': 'משפחת כהן',
        'טלפון': '054-5551234',
        'מספר אורחים': 4,
        'צד': 'משותף',
        'אישור הגעה': '',
        'הערות': 'חברים משותפים'
      }
    ];

    // יצירת גיליון עבודה
    const ws = XLSX.utils.json_to_sheet(templateData);

    // הוספת הוראות בתחילת הגיליון
    XLSX.utils.sheet_add_aoa(ws, [
      ['תבנית לייבוא רשימת אורחים'],
      ['הוראות:'],
      ['1. מלא את הפרטים בטבלה מתחת לכותרות'],
      ['2. עמודת "שם" היא חובה, שאר העמודות אופציונליות'],
      ['3. עבור "צד" ניתן לרשום: חתן, כלה, או משותף'],
      ['4. עבור "אישור הגעה" ניתן לרשום: כן, לא, או להשאיר ריק'],
      ['']
    ], { origin: 'A1' });

    // התאמת רוחב העמודות
    const wscols = [
      { wch: 20 }, // שם
      { wch: 15 }, // טלפון
      { wch: 8 },  // מספר אורחים
      { wch: 10 }, // צד
      { wch: 10 }, // אישור הגעה
      { wch: 30 }  // הערות
    ];
    ws['!cols'] = wscols;

    // יצירת הספר
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'רשימת אורחים');

    // הורדת הקובץ
    XLSX.writeFile(wb, 'תבנית_רשימת_אורחים.xlsx');
  };

  // פונקציה למחיקת כל האורחים (לצורכי פיתוח בלבד)
  const handleDeleteAllGuests = async () => {
    // בקשת אישור מהמשתמש לפני מחיקה
    if (!confirm('אזהרה: פעולה זו תמחק את כל האורחים ברשימה! האם אתה בטוח שברצונך להמשיך?')) {
      return; // המשתמש ביטל את הפעולה
    }
    
    // אישור נוסף למניעת מחיקה בטעות
    if (!confirm('אישור סופי: כל האורחים יימחקו ולא ניתן יהיה לשחזר אותם. האם להמשיך?')) {
      return; // המשתמש ביטל את הפעולה
    }
    
    try {
      // קריאה ל-API למחיקת כל האורחים
      const response = await fetch(`/api/guests/delete-all?userId=${params.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete all guests');
      }
      
      // ריקון רשימת האורחים במצב
      setGuests([]);
      
      // הודעה למשתמש
      alert(`כל האורחים נמחקו בהצלחה (${data.deletedCount} אורחים)`);
    } catch (error) {
      console.error('Failed to delete all guests:', error);
      alert('שגיאה במחיקת כל האורחים. אנא נסה שוב.');
    }
  };

  // הוסף ביטומבו חדש למטה לרענון רשימת האורחים
  const handleForceRefresh = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // נקה את הזיכרון המטמון
      dataCache.clear();
      
      // קריאה ישירה ל-API ללא שימוש בקאש עם זמן ייחודי למניעת קאשינג
      // וגם עם דגל לסינכרון מלא בין החשבונות
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/guests?userId=${params.id}&t=${timestamp}&forceSync=true&forceRefresh=true`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // עיבוד התוצאות
      let fetchedGuests = [];
      
      // בדיקה אם guests הוא מערך ישירות או מבנה מורכב יותר
      if (Array.isArray(data.guests)) {
        // אם זה מערך ישיר
        fetchedGuests = data.guests;
        console.log('Guests are in array format:', fetchedGuests.length);
      } else if (data.guests && data.guests.sides) {
        // אם זה מבנה מורכב עם צדדים
        fetchedGuests = [
          ...data.guests.sides['חתן'],
          ...data.guests.sides['כלה'],
          ...data.guests.sides['משותף']
        ];
      }
      
      // עדכון הסטייט
      setGuests(fetchedGuests);
      
      // הודעת הצלחה זמנית
      alert('רשימת האורחים סונכרנה בהצלחה');
      
    } catch (error) {
      console.error('Error in force refresh:', error);
      setError('שגיאה ברענון רשימת האורחים');
    } finally {
      setIsLoading(false);
    }
  };

  // יצירת רכיב טעינה
  if (!isAuthReady || isLoading) {
    return (
      <LoadingSpinner 
        text="טוען את רשימת האורחים..." 
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-500 text-xl font-bold mb-4">שגיאה בטעינת הנתונים</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => { 
                setIsLoading(true);
                setError('');
                Promise.all([fetchGuestlist(), fetchUserProfile()])
                  .finally(() => setIsLoading(false));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              נסה שנית
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getGuestStats();

  
  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'M PLUS 1p', sans-serif;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
        {/* הוספת style לאנימציית הספינר */}
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Head>
      <Navbar />
      
      {/* מסך הטעינה בזמן ייבוא */}
      {importOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">מייבא רשימת אורחים</h3>
            
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
            
            <div className="mb-4">
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress.total ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-gray-600 mt-2">
                {importProgress.current} מתוך {importProgress.total} אורחים
              </div>
            </div>
            
            {importProgress.currentName && (
              <div className="text-gray-600">
                מייבא כעת: {importProgress.currentName}
              </div>
            )}
            
            <p className="text-gray-600 mt-4">
              אנא המתן... התהליך עשוי להימשך מספר דקות בהתאם לגודל הקובץ.
            </p>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-2xl font-bold tracking-tight">ניהול רשימת מוזמנים</h1>
              <Button onClick={() => setIsAddingGuest(!isAddingGuest)}>
                {isAddingGuest ? 'ביטול' : 'הוספת מוזמן חדש'}
              </Button>
            </div>
            
            {/* הצגת הודעה על מצב חיבור בין חשבונות */}
            {user?.connectedUserId && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 text-sm">
                <div className="font-medium mb-1">חשבון מחובר - נתונים משותפים</div>
                <p>
                  חשבון זה מחובר לחשבון של {user.partnerName || 'השותף/ה שלך'}.
                  רשימת המוזמנים מסונכרנת בין שני החשבונות.
                  {user.isMainEventOwner 
                    ? ' אתה מוגדר כבעל החשבון הראשי.' 
                    : ' השינויים שלך יופיעו גם בחשבון השותף.'}
                </p>
                <div className="flex flex-col mt-2">
                  <button 
                    onClick={handleForceRefresh}
                    className="mb-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    סנכרן רשימת אורחים מלאה
                  </button>
                  <p className="text-xs text-blue-600">
                    אם אתה לא רואה את כל האורחים או יש בעיות סנכרון, לחץ על כפתור הסנכרון לביצוע סנכרון מלא בין החשבונות.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* סיכום סטטיסטי */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalCount}</div>
              <div className="text-gray-600 text-lg">סה&quot;כ הזמנות</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.confirmedCount}</div>
              <div className="text-gray-600 text-lg">הזמנות שאושרו</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.declinedCount}</div>
              <div className="text-gray-600 text-lg">הזמנות שנדחו</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingCount}</div>
              <div className="text-gray-600 text-lg">הזמנות בהמתנה</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 mb-10">
            <div className="text-2xl font-bold text-gray-800 mb-4 text-center">סיכום מספר האנשים</div>
            <div className="flex flex-col md:flex-row justify-between text-center gap-6">
              <div className="flex-1 p-4 bg-purple-50 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-2">{stats.totalGuests}</div>
                <div className="text-gray-600 text-lg">סה&quot;כ אנשים שהוזמנו</div>
              </div>
              <div className="flex-1 p-4 bg-indigo-50 rounded-xl">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.confirmedGuests}</div>
                <div className="text-gray-600 text-lg">אנשים שאישרו הגעה</div>
              </div>
            </div>
          </div>

          {/* פקדי סינון */}
          <div className="flex flex-wrap gap-5 mb-10 bg-white p-6 rounded-xl shadow-md">
            <div className="flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="חיפוש אורח..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'confirmed' | 'declined' | 'pending')}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg min-w-[180px]"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="confirmed">אישרו הגעה</option>
              <option value="declined">לא מגיעים</option>
              <option value="pending">ממתינים לאישור</option>
            </select>
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value as 'all' | 'חתן' | 'כלה' | 'משותף')}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg min-w-[180px]"
            >
              <option value="all">כל הצדדים</option>
              <option value="חתן">צד החתן</option>
              <option value="כלה">צד הכלה</option>
              <option value="משותף">משותף</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddingGuest(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center text-lg min-w-[160px] justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                      הוסף אורח
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleExcelTemplateDownload}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center text-lg justify-center"
                  title="הורד תבנית Excel למילוי"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  תבנית Excel
                </button>
                
                <label className="relative">
                  <input 
                    type="file" 
                    accept=".xlsx,.xls" 
                    onChange={handleExcelImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isImporting}
                  />
                  <span className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center text-lg min-w-[160px] justify-center ${isImporting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    {isImporting ? 'מייבא...' : 'ייבוא מ-Excel'}
                  </span>
                </label>
                
                <button
                  onClick={handleDeleteAllGuests}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center text-lg justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  מחק הכל
                </button>
              </div>
            </div>
          </div>

          {/* הודעת סטטוס ייבוא חדשה */}
          {showImportStatus && importStatus && (
            <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-fade-in">
              <div className={`relative rounded-lg shadow-lg p-4 border-r-4 ${
                importStatus.error === 0 ? 'bg-white border-green-500' : 'bg-white border-yellow-500'
              }`}>
                <button 
                  onClick={() => setShowImportStatus(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="סגור"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="mb-3">
                  <h3 className={`text-lg font-bold mb-1 ${
                    importStatus.error === 0 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {importStatus.error === 0 ? 'הייבוא הסתיים בהצלחה' : 'הייבוא הסתיים עם שגיאות'}
                  </h3>
                  
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      importStatus.error === 0 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {importStatus.error === 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-gray-700 mb-1">
                        <span className="font-semibold text-green-600">{importStatus.success}</span> אורחים נוספו בהצלחה
                        {importStatus.error > 0 && (
                          <span className="mr-2">
                            <span className="font-semibold text-red-600">{importStatus.error}</span> אורחים לא נוספו
                          </span>
                        )}
                      </p>
                      
                      {/* פירוט השגיאות */}
                      {importStatus.error > 0 && importStatus.errorDetails && (
                        <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                          <p className="font-semibold text-gray-700 mb-1">פירוט השגיאות:</p>
                          <ul className="text-gray-600 space-y-1 pr-4">
                            {importStatus.errorDetails.missingName! > 0 && (
                              <li>• {importStatus.errorDetails.missingName} שורות ללא שם אורח</li>
                            )}
                            {importStatus.errorDetails.invalidPhone! > 0 && (
                              <li>• {importStatus.errorDetails.invalidPhone} שורות עם מספר טלפון לא תקין</li>
                            )}
                            {importStatus.errorDetails.apiErrors! > 0 && (
                              <li>• {importStatus.errorDetails.apiErrors} שגיאות תקשורת עם השרת</li>
                            )}
                            {importStatus.errorDetails.otherErrors! > 0 && (
                              <li>• {importStatus.errorDetails.otherErrors} שגיאות אחרות</li>
                            )}
                          </ul>
                          
                          <div className="mt-2">
                            <button
                              onClick={handleExcelTemplateDownload}
                              className="text-blue-600 hover:text-blue-800 transition-colors text-sm flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              הורד תבנית אקסל
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* טבלת האורחים */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {/* Logs for debugging */}
              {(() => {
                console.log('In JSX, guests length:', guests.length);
                console.log('In JSX, filteredGuests length:', filteredGuests.length);
                return null;
              })()}
              
              {!Array.isArray(guests) ? (
                <div className="text-center p-8">שגיאה: הנתונים אינם במבנה הנכון</div>
              ) : guests.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-gray-500 mb-4">אין אורחים ברשימה</p>
                  <button 
                    onClick={() => fetchGuestlist()} 
                    className="text-blue-500 underline px-4 py-2 border rounded-lg"
                  >
                    נסה לטעון מחדש
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                        שם אורח
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                        מספר טלפון
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                        מספר מוזמנים
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                        מהצד של
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                        סטטוס
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                        הערות
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedGuests.map(guest => (
                      <tr key={guest._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          {editingGuestId === guest._id ? (
                            <input
                              type="text"
                              value={guest.name}
                              onChange={(e) => handleEditGuest({...guest, name: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded text-lg"
                            />
                          ) : (
                            <div className="text-base font-medium text-gray-900">{guest.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {editingGuestId === guest._id ? (
                            <input
                              type="text"
                              value={guest.phoneNumber}
                              onChange={(e) => handleEditGuest({...guest, phoneNumber: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded text-lg"
                            />
                          ) : (
                            <div className="text-base text-gray-600">{guest.phoneNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          {editingGuestId === guest._id ? (
                            <input
                              type="number"
                              min="0"
                              value={guest.numberOfGuests}
                              onChange={(e) => handleEditGuest({...guest, numberOfGuests: parseInt(e.target.value) || 0})}
                              className="w-20 p-2 border border-gray-300 rounded text-center text-lg"
                            />
                          ) : (
                            <div className="text-base text-gray-900 font-medium">{guest.numberOfGuests}</div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          {editingGuestId === guest._id ? (
                            <select
                              value={guest.side}
                              onChange={(e) => handleEditGuest({...guest, side: e.target.value as 'חתן' | 'כלה' | 'משותף'})}
                              className="p-2 border border-gray-300 rounded text-lg"
                            >
                              <option value="חתן">חתן</option>
                              <option value="כלה">כלה</option>
                              <option value="משותף">משותף</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${
                              guest.side === 'חתן' ? 'bg-blue-100 text-blue-800' : 
                              guest.side === 'כלה' ? 'bg-pink-100 text-pink-800' : 
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {guest.side}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <div className="grid grid-cols-3 gap-4 w-[160px] mx-auto">
                            <button
                              onClick={() => handleConfirmGuest(guest._id, true)}
                              className={`p-1.5 rounded-full flex items-center justify-center ${guest.isConfirmed === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                              title="אישר/ה הגעה"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleConfirmGuest(guest._id, false)}
                              className={`p-1.5 rounded-full flex items-center justify-center ${guest.isConfirmed === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                              title="לא מגיע/ה"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleConfirmGuest(guest._id, null)}
                              className={`p-1.5 rounded-full flex items-center justify-center ${guest.isConfirmed === null ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                              title="ממתין/ה לאישור"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {editingGuestId === guest._id ? (
                            <input
                              type="text"
                              value={guest.notes}
                              onChange={(e) => handleEditGuest({...guest, notes: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded text-lg"
                            />
                          ) : (
                            <div className="text-base text-gray-600">{guest.notes}</div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          {editingGuestId === guest._id ? (
                            <button 
                              onClick={() => handleEditGuest(guest)} 
                              className="text-green-600 hover:text-green-900 text-lg font-medium"
                            >
                              שמור
                            </button>
                          ) : (
                            <div className="flex justify-center space-x-6">
                              <button 
                                onClick={() => handleEditGuest(guest)} 
                                className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-100 rounded-full transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteGuest(guest._id)} 
                                className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-100 rounded-full transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* שורה להוספת אורח חדש */}
                    {isAddingGuest && (
                      <tr className="bg-blue-50">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <input
                            type="text"
                            value={newGuest.name}
                            onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                            placeholder="שם האורח"
                            className="w-full p-2 border border-gray-300 rounded text-lg"
                            autoFocus
                          />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <input
                            type="text"
                            value={newGuest.phoneNumber}
                            onChange={(e) => setNewGuest({...newGuest, phoneNumber: e.target.value})}
                            placeholder="מספר טלפון"
                            className="w-full p-2 border border-gray-300 rounded text-lg"
                          />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="0"
                            value={newGuest.numberOfGuests}
                            onChange={(e) => setNewGuest({...newGuest, numberOfGuests: parseInt(e.target.value) || 0})}
                            className="w-20 p-2 border border-gray-300 rounded text-center text-lg"
                          />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <select
                            value={newGuest.side}
                            onChange={(e) => setNewGuest({...newGuest, side: e.target.value as 'חתן' | 'כלה' | 'משותף'})}
                            className="p-2 border border-gray-300 rounded text-lg"
                          >
                            <option value="חתן">חתן</option>
                            <option value="כלה">כלה</option>
                            <option value="משותף">משותף</option>
                          </select>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <div className="grid grid-cols-3 gap-4 w-[160px] mx-auto">
                            <button
                              onClick={() => setNewGuest({...newGuest, isConfirmed: true})}
                              className={`p-1.5 rounded-full flex items-center justify-center ${newGuest.isConfirmed === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                              title="אישר/ה הגעה"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setNewGuest({...newGuest, isConfirmed: false})}
                              className={`p-1.5 rounded-full flex items-center justify-center ${newGuest.isConfirmed === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                              title="לא מגיע/ה"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setNewGuest({...newGuest, isConfirmed: null})}
                              className={`p-1.5 rounded-full flex items-center justify-center ${newGuest.isConfirmed === null ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                              title="ממתין/ה לאישור"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <input
                            type="text"
                            value={newGuest.notes}
                            onChange={(e) => setNewGuest({...newGuest, notes: e.target.value})}
                            placeholder="הערות"
                            className="w-full p-2 border border-gray-300 rounded text-lg"
                          />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <div className="flex justify-between gap-2">
                            {/* טופס הוספת אורח - כפתור משופר */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault(); // עצירת פעולות ברירת מחדל
                                console.log('*** כפתור נלחץ - מתחיל תהליך הוספת אורח ***', new Date().toISOString());
                                console.log('מצב הכפתור:', !newGuest.name.trim() ? 'לא פעיל' : 'פעיל');
                                console.log('שם אורח:', newGuest.name);
                                handleAddGuest();
                              }}
                              disabled={!newGuest.name.trim()}
                              className={`flex-grow p-2 rounded-md ${
                               !newGuest.name.trim() 
                                  ? 'bg-gray-300 cursor-not-allowed' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              הוסף אורח
                            </button>
                            {/* כפתור גיבוי מסוג div לבדיקה */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                console.log('*** DIV גיבוי נלחץ ***');
                                handleAddGuest();
                              }}
                              className="flex-grow p-2 rounded-md bg-green-600 hover:bg-green-700 text-white cursor-pointer text-center mt-2"
                            >
                              נסה להוסיף אורח (גיבוי)
                            </div>
                            <button
                              onClick={() => setIsAddingGuest(false)}
                              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* רכיב דפדוף משופר מתחת לטבלה */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-md bg-white rounded-lg shadow-sm p-2 mb-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`flex items-center justify-center px-4 py-2 rounded ${
              currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-600 hover:bg-blue-50 transition-colors'
            }`}
          >
            <svg className="h-5 w-5 rtl:rotate-180" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="mr-2">הקודם</span>
          </button>
          
          <span className="text-sm font-medium">
            דף {currentPage} מתוך {totalPages || 1}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`flex items-center justify-center px-4 py-2 rounded ${
              currentPage === totalPages || totalPages === 0
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-600 hover:bg-blue-50 transition-colors'
            }`}
          >
            <span className="ml-2">הבא</span>
            <svg className="h-5 w-5 rtl:rotate-180" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="text-sm text-gray-600 flex items-center">
          מציג {paginatedGuests.length} אורחים מתוך {filteredGuests.length} בסך הכל
          {filteredGuests.length > 0 && (
            <span className="mx-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              {Math.ceil(filteredGuests.length / itemsPerPage)} דפים
            </span>
          )}
        </div>
      </div>
    </>
  );
}
