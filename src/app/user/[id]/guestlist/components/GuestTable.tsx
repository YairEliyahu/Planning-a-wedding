'use client';

import { useState, useMemo } from 'react';
import { useGuests, Guest } from '../context/GuestContext';
import toast from 'react-hot-toast';

interface GuestTableProps {
  onAddGuest: () => void;
}

export function GuestTable({ onAddGuest }: GuestTableProps) {
  const { 
    filteredGuests, 
    updateGuest, 
    deleteGuest, 
    confirmGuest,
    isLoading
  } = useGuests();
  
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Pagination
  const paginatedGuests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGuests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGuests, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredGuests.length / itemsPerPage);
  }, [filteredGuests, itemsPerPage]);

  const handleEditGuest = async (guest: Guest) => {
    try {
      if (editingGuestId === guest._id) {
        // Save changes
        await updateGuest(guest);
        setEditingGuestId(null);
        toast.success(`✅ ${guest.name} עודכן בהצלחה`);
      } else {
        // Start editing
        setEditingGuestId(guest._id);
      }
    } catch (error) {
      console.error('Error editing guest:', error);
      toast.error('❌ שגיאה בעדכון האורח. אנא נסה שוב.');
    }
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    const confirm = window.confirm(`האם אתה בטוח שברצונך למחוק את ${guestName}?`);
    if (!confirm) {
      return;
    }
    
    try {
      await deleteGuest(guestId);
      toast.success(`🗑️ ${guestName} נמחק בהצלחה`);
    } catch (error) {
      console.error('Failed to delete guest:', error);
      toast.error('❌ שגיאה במחיקת האורח. אנא נסה שוב.');
    }
  };

  const handleConfirmGuest = async (guestId: string, status: boolean | null, guestName: string) => {
    try {
      await confirmGuest(guestId, status);
      const statusText = status === true ? 'אישר/ה הגעה' : status === false ? 'לא מגיע/ה' : 'ממתין לאישור';
      toast.success(`✅ ${guestName}: ${statusText}`);
    } catch (error) {
      console.error('Failed to update guest status:', error);
      toast.error('❌ שגיאה בעדכון סטטוס האורח. אנא נסה שוב.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 rounded-full mx-auto mb-4"></div>
        <p>טוען רשימת אורחים...</p>
      </div>
    );
  }

  if (!Array.isArray(filteredGuests)) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-500">שגיאה: הנתונים אינם במבנה הנכון</p>
      </div>
    );
  }

  if (filteredGuests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500 mb-4">אין אורחים ברשימה</p>
        <button 
          onClick={onAddGuest}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors mb-4"
        >
          הוסף אורח ראשון
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  שם אורח
                </th>
                <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  טלפון
                </th>
                <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מספר מוזמנים
                </th>
                <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  צד
                </th>
                <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  קבוצה
                </th>
                <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  הערות
                </th>
                <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedGuests.map(guest => (
                <tr key={guest._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingGuestId === guest._id ? (
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) => handleEditGuest({...guest, name: e.target.value})}
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    {editingGuestId === guest._id ? (
                      <input
                        type="text"
                        value={guest.phoneNumber || ''}
                        onChange={(e) => handleEditGuest({...guest, phoneNumber: e.target.value})}
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-600">{guest.phoneNumber}</div>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-center">
                    {editingGuestId === guest._id ? (
                      <input
                        type="number"
                        min="0"
                        value={guest.numberOfGuests}
                        onChange={(e) => handleEditGuest({...guest, numberOfGuests: parseInt(e.target.value) || 1})}
                        className="w-16 p-1 border border-gray-300 rounded text-center text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 font-medium">{guest.numberOfGuests}</div>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-center">
                    {editingGuestId === guest._id ? (
                      <select
                        value={guest.side}
                        onChange={(e) => handleEditGuest({...guest, side: e.target.value as 'חתן' | 'כלה' | 'משותף'})}
                        className="p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="חתן">חתן</option>
                        <option value="כלה">כלה</option>
                        <option value="משותף">משותף</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        guest.side === 'חתן' ? 'bg-blue-100 text-blue-800' : 
                        guest.side === 'כלה' ? 'bg-pink-100 text-pink-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {guest.side}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-center">
                    {editingGuestId === guest._id ? (
                      <select
                        value={guest.group || ''}
                        onChange={(e) => handleEditGuest({...guest, group: e.target.value})}
                        className="p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">ללא</option>
                        <option value="משפחה">משפחה</option>
                        <option value="עבודה">עבודה</option>
                        <option value="חברים">חברים</option>
                        <option value="צבא">צבא</option>
                        <option value="לימודים">לימודים</option>
                        <option value="שכונה">שכונה</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        guest.group === 'משפחה' ? 'bg-blue-100 text-blue-800' : 
                        guest.group === 'עבודה' ? 'bg-green-100 text-green-800' : 
                        guest.group === 'חברים' ? 'bg-pink-100 text-pink-800' : 
                        guest.group === 'צבא' ? 'bg-purple-100 text-purple-800' : 
                        guest.group === 'לימודים' ? 'bg-indigo-100 text-indigo-800' : 
                        guest.group === 'שכונה' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {guest.group || 'ללא'}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-center">
                    <div className="grid grid-cols-3 gap-1 w-[120px] mx-auto">
                      <button
                        onClick={() => handleConfirmGuest(guest._id, true, guest.name)}
                        className={`p-1 rounded-full flex items-center justify-center ${guest.isConfirmed === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                        title="אישר/ה הגעה"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleConfirmGuest(guest._id, false, guest.name)}
                        className={`p-1 rounded-full flex items-center justify-center ${guest.isConfirmed === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                        title="לא מגיע/ה"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleConfirmGuest(guest._id, null, guest.name)}
                        className={`p-1 rounded-full flex items-center justify-center ${guest.isConfirmed === null ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'} hover:opacity-80 transition-opacity`}
                        title="ממתין/ה לאישור"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    {editingGuestId === guest._id ? (
                      <input
                        type="text"
                        value={guest.notes}
                        onChange={(e) => handleEditGuest({...guest, notes: e.target.value})}
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <div className="text-sm text-gray-600 max-w-[150px] truncate" title={guest.notes}>{guest.notes}</div>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-center">
                    {editingGuestId === guest._id ? (
                      <button 
                        onClick={() => handleEditGuest(guest)} 
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        שמור
                      </button>
                    ) : (
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEditGuest(guest)} 
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-100 rounded-full transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteGuest(guest._id, guest.name)} 
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
              דף {currentPage} מתוך {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center px-4 py-2 rounded ${
                currentPage === totalPages
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
            <span className="mx-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              {totalPages} דפים
            </span>
          </div>
        </div>
      )}
    </>
  );
} 