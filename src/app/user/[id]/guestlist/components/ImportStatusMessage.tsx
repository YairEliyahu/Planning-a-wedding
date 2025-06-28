'use client';

import { guestService } from '../services/guestService';

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
  if (!isVisible || !status) return null;

  const isSuccess = status.error === 0;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-fade-in">
      <div className={`relative rounded-lg shadow-lg p-4 border-r-4 ${
        isSuccess ? 'bg-white border-green-500' : 'bg-white border-yellow-500'
      }`}>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="סגור"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="mb-3">
          <h3 className={`text-lg font-bold mb-1 ${
            isSuccess ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {isSuccess ? 'הייבוא הסתיים בהצלחה' : 'הייבוא הסתיים עם שגיאות'}
          </h3>
          
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isSuccess ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {isSuccess ? (
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
                <span className="font-semibold text-green-600">{status.success}</span> אורחים נוספו בהצלחה
                {status.error > 0 && (
                  <span className="mr-2">
                    <span className="font-semibold text-red-600">{status.error}</span> אורחים לא נוספו
                  </span>
                )}
              </p>
              
              {/* Error details */}
              {status.error > 0 && status.errorDetails && (
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                  <p className="font-semibold text-gray-700 mb-1">פירוט השגיאות:</p>
                  <ul className="text-gray-600 space-y-1 pr-4">
                    {status.errorDetails.missingName! > 0 && (
                      <li>• {status.errorDetails.missingName} שורות ללא שם אורח</li>
                    )}
                    {status.errorDetails.invalidPhone! > 0 && (
                      <li>• {status.errorDetails.invalidPhone} שורות עם מספר טלפון לא תקין</li>
                    )}
                    {status.errorDetails.apiErrors! > 0 && (
                      <li>• {status.errorDetails.apiErrors} שגיאות תקשורת עם השרת</li>
                    )}
                    {status.errorDetails.otherErrors! > 0 && (
                      <li>• {status.errorDetails.otherErrors} שגיאות אחרות</li>
                    )}
                  </ul>
                  
                  <div className="mt-2">
                    <button
                      onClick={() => guestService.downloadTemplate()}
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
  );
} 