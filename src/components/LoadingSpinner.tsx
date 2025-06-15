interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  bgOpacity?: number;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = '#ff4081', 
  text = 'טוען...',
  fullScreen = false,
  bgOpacity = 0.5
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const spinnerColor = color === 'pink' ? '#ff4081' : color;

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ 
          backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
          backdropFilter: 'blur(4px)'
        }}
      >
        <div 
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-4 rounded-full animate-spin mb-4`}
          style={{ borderTopColor: spinnerColor }}
        ></div>
        {text && (
          <p className="text-gray-700 font-heebo text-lg font-medium">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-4 rounded-full animate-spin`}
        style={{ borderTopColor: spinnerColor }}
      ></div>
      {text && (
        <p className="mt-2 text-gray-600 font-heebo text-sm">{text}</p>
      )}
    </div>
  );
} 