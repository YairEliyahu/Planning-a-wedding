'use client';

import { useEffect } from 'react';

interface ImportStatusMessageProps {
  isVisible: boolean;
  onClose: () => void;
  status: {
    success: number;
    error: number;
    errorDetails?: {
      missingName?: number;
      invalidPhone?: number;
      apiErrors?: number;
      otherErrors?: number;
    };
  } | null;
}

export function ImportStatusMessage({ isVisible, onClose, status }: ImportStatusMessageProps) {
  useEffect(() => {
    if (isVisible && status) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000); // Auto-close after 8 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, status, onClose]);

  if (!isVisible || !status) return null;

  const total = status.success + status.error;
  const isSuccess = status.success > 0;
  const hasErrors = status.error > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            📊 תוצאות ייבוא Excel
          </h3>
        <button 
          onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
        >
            ×
        </button>
        </div>

        {/* Main Status */}
        <div className="mb-4">
          {isSuccess && !hasErrors && (
            <div className="flex items-center text-green-600 mb-2">
              <span className="text-2xl mr-2">✅</span>
              <span className="font-semibold">ייבוא הושלם בהצלחה!</span>
            </div>
          )}
          
          {isSuccess && hasErrors && (
            <div className="flex items-center text-yellow-600 mb-2">
              <span className="text-2xl mr-2">⚠️</span>
              <span className="font-semibold">ייבוא הושלם עם שגיאות</span>
            </div>
          )}
          
          {!isSuccess && hasErrors && (
            <div className="flex items-center text-red-600 mb-2">
              <span className="text-2xl mr-2">❌</span>
              <span className="font-semibold">ייבוא נכשל</span>
            </div>
              )}
            </div>
            
        {/* Statistics */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{status.success}</div>
              <div className="text-sm text-gray-600">הצליחו</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{status.error}</div>
              <div className="text-sm text-gray-600">נכשלו</div>
            </div>
          </div>
          <div className="mt-2 text-center text-sm text-gray-500">
            סה"כ {total} רשומות עובדו
          </div>
        </div>
              
        {/* Error Details */}
        {hasErrors && status.errorDetails && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">פירוט שגיאות:</h4>
            <div className="text-sm space-y-1">
              {status.errorDetails.missingName && status.errorDetails.missingName > 0 && (
                <div className="text-red-600">
                  • {status.errorDetails.missingName} רשומות ללא שם
                </div>
              )}
              {status.errorDetails.apiErrors && status.errorDetails.apiErrors > 0 && (
                <div className="text-red-600">
                  • {status.errorDetails.apiErrors} שגיאות שרת
                </div>
                    )}
              {status.errorDetails.otherErrors && status.errorDetails.otherErrors > 0 && (
                <div className="text-red-600">
                  • {status.errorDetails.otherErrors} שגיאות נוספות
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            <div className="font-semibold">🎉 האורחים נוספו בהצלחה!</div>
            <div>רשימת המוזמנים והסטטיסטיקות עודכנו אוטומטית.</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            הבנתי
          </button>
        </div>
      </div>
    </div>
  );
} 