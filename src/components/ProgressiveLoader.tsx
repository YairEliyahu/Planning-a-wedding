import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStage {
  id: string;
  label: string;
  completed: boolean;
  loading: boolean;
}

interface ProgressiveLoaderProps {
  stages: LoadingStage[];
  title?: string;
  className?: string;
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  stages,
  title = 'טוען נתונים...',
  className = ''
}) => {
  const currentStage = stages.find(stage => stage.loading) || stages[stages.length - 1];
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-white ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 max-w-md w-full mx-4">
        {/* כותרת */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-2">
            {title}
          </h2>
          <p className="text-gray-600 text-sm">
            {currentStage.label}
          </p>
        </div>
        
        {/* טעינה מרכזית */}
        <div className="flex justify-center mb-8">
          <LoadingSpinner 
            size="large"
            color="pink"
            text=""
            fullScreen={false}
          />
        </div>
        
        {/* רשימת שלבים */}
        <div className="space-y-3">
          {stages.map((stage, _index) => (
            <div key={stage.id} className="flex items-center gap-3">
              {stage.completed ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : stage.loading ? (
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
              )}
              
              <span className={`text-sm ${
                stage.completed ? 'text-green-600 font-medium' :
                stage.loading ? 'text-pink-600 font-medium' :
                'text-gray-500'
              }`}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${(stages.filter(s => s.completed).length / stages.length) * 100}%`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>התחלה</span>
            <span>{stages.filter(s => s.completed).length}/{stages.length}</span>
            <span>סיום</span>
          </div>
        </div>

        {/* New Progress Bar */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            {Array.from({ length: (stages.filter(s => s.completed).length / stages.length) * 100 }).map((_, _index) => (
              <div key={_index} className="w-2 h-8 bg-gradient-to-t from-pink-500 to-purple-600 rounded-full animate-bounce" 
                   style={{ animationDelay: `${_index * 0.1}s` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>התחלה</span>
            <span>{stages.filter(s => s.completed).length}/{stages.length}</span>
            <span>סיום</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveLoader; 