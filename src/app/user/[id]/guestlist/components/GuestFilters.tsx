'use client';

import { useGuests } from '../context/GuestContext';
import { guestService } from '../services/guestService';

interface GuestFiltersProps {
  onAddGuest: () => void;
  onImport: (file: File) => void;
}

export function GuestFilters({ onAddGuest, onImport }: GuestFiltersProps) {
  const { 
    filters, 
    setFilters, 
    deleteAllGuests, 
    cleanupDuplicates, 
    forceRefresh,
    isLoading 
  } = useGuests();

  const handleDeleteAll = async () => {
    if (!confirm('אזהרה: פעולה זו תמחק את כל האורחים ברשימה! האם אתה בטוח שברצונך להמשיך?')) {
      return;
    }
    
    if (!confirm('אישור סופי: כל האורחים יימחקו ולא ניתן יהיה לשחזר אותם. האם להמשיך?')) {
      return;
    }
    
    try {
      const result = await deleteAllGuests();
      alert(`כל האורחים נמחקו בהצלחה (${result.deletedCount} אורחים)`);
    } catch (error) {
      alert('שגיאה במחיקת כל האורחים. אנא נסה שוב.');
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!confirm('פעולה זו תסיר כפילויות מרשימת האורחים. האם להמשיך?')) {
      return;
    }
    
    try {
      const result = await cleanupDuplicates();
      alert(`ניקוי הושלם: ${result.removedCount} כפילויות הוסרו`);
    } catch (error) {
      alert('שגיאה בניקוי כפילויות');
    }
  };

  const handleForceRefresh = async () => {
    try {
      await forceRefresh();
      alert('רשימת האורחים סונכרנה בהצלחה');
    } catch (error) {
      alert('שגיאה ברענון רשימת האורחים');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="flex flex-wrap gap-5 mb-10 bg-white p-6 rounded-xl shadow-md">
      <div className="flex-1 min-w-[250px]">
        <input
          type="text"
          placeholder="חיפוש אורח..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </div>
      
      <select
        value={filters.filter}
        onChange={(e) => setFilters({ filter: e.target.value as 'all' | 'confirmed' | 'declined' | 'pending' })}
        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg min-w-[180px]"
      >
        <option value="all">כל הסטטוסים</option>
        <option value="confirmed">אישרו הגעה</option>
        <option value="declined">לא מגיעים</option>
        <option value="pending">ממתינים לאישור</option>
      </select>
      
      <select
        value={filters.sideFilter}
        onChange={(e) => setFilters({ sideFilter: e.target.value as 'all' | 'חתן' | 'כלה' | 'משותף' })}
        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg min-w-[180px]"
      >
        <option value="all">כל הצדדים</option>
        <option value="חתן">צד החתן</option>
        <option value="כלה">צד הכלה</option>
        <option value="משותף">משותף</option>
      </select>
      
      <div className="flex gap-3">
        <button
          onClick={onAddGuest}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center text-lg min-w-[160px] justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          הוסף אורח
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => guestService.downloadTemplate()}
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
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <span className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center text-lg min-w-[160px] justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              {isLoading ? 'מייבא...' : 'ייבוא מ-Excel'}
            </span>
          </label>
          
          <button
            onClick={handleCleanupDuplicates}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center text-lg justify-center disabled:opacity-70"
            title="נקה כפילויות מרשימת האורחים"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            נקה כפילויות
          </button>
          
          <button
            onClick={handleForceRefresh}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center text-lg justify-center disabled:opacity-70"
            title="רענן רשימת אורחים"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            רענן
          </button>
          
          <button
            onClick={handleDeleteAll}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center text-lg justify-center disabled:opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            מחק הכל
          </button>
        </div>
      </div>
    </div>
  );
} 