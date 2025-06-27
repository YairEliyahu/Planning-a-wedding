'use client';

import { useChecklistContext } from '../context/ChecklistContext';

export default function ResetButton() {
  const { 
    showResetConfirm, 
    setShowResetConfirm, 
    resetChecklist 
  } = useChecklistContext();

  const handleReset = () => {
    resetChecklist();
  };

  return (
    <>
      <button
        onClick={() => setShowResetConfirm(true)}
        className="fixed left-4 top-24 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        <span>אפס נתונים</span>
      </button>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">אישור איפוס נתונים</h3>
            <p className="text-gray-600 mb-6">
              האם אתה בטוח שברצונך לאפס את כל הנתונים? פעולה זו לא ניתנת לביטול.
            </p>
            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                לא
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                כן, אפס הכל
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 