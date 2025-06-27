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
        <h3 className="text-2xl font-bold text-gray-800 mb-4">מייבא רשימת אורחים</h3>
        
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
        
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` 
              }}
            ></div>
          </div>
          <div className="text-gray-600 mt-2">
            {progress.current} מתוך {progress.total} אורחים
          </div>
        </div>
        
        {progress.currentName && (
          <div className="text-gray-600">
            מייבא כעת: {progress.currentName}
          </div>
        )}
        
        <p className="text-gray-600 mt-4">
          אנא המתן... התהליך עשוי להימשך מספר דקות בהתאם לגודל הקובץ.
        </p>
      </div>
    </div>
  );
} 