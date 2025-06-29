'use client';

interface LoadingOverlayProps {
  isVisible: boolean;
  progress: {
    current: number;
    total: number;
    currentName: string;
  };
}

export function LoadingOverlay({ isVisible, progress }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center relative">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">מייבא רשימת אורחים...</h3>
          
          {progress.total > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                מעבד {progress.current} מתוך {progress.total} אורחים
              </div>
              
              {progress.currentName && (
                <div className="text-sm text-blue-600 font-medium">
                  עכשיו: {progress.currentName}
                </div>
              )}
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md mx-auto">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500">
                {Math.round((progress.current / progress.total) * 100)}% הושלם
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              מכין לייבוא...
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mt-4">
          אנא המתן... התהליך עשוי להימשך מספר דקות בהתאם לגודל הקובץ.
        </p>
      </div>
    </div>
  );
} 