import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
  color?: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
  bgOpacity?: number;
}

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'טוען...', 
  fullScreen = false,
  color = 'pink',
  bgOpacity = 0.8
}: LoadingSpinnerProps) => {
  const spinnerSizes = {
    small: {
      height: '1.5rem',
      width: '1.5rem',
      borderWidth: '2px',
    },
    medium: {
      height: '3rem',
      width: '3rem',
      borderWidth: '3px',
    },
    large: {
      height: '5rem',
      width: '5rem',
      borderWidth: '4px',
    },
  };

  const spinnerColors = {
    pink: 'border-pink-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500'
  };

  const textColors = {
    pink: 'text-pink-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  const spinTransition = {
    loop: Infinity,
    ease: 'linear',
    duration: 1
  };

  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? `min-h-screen fixed inset-0 bg-white bg-opacity-${bgOpacity*100} z-50` : ''}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={spinTransition}
          style={spinnerSizes[size]}
          className={`rounded-full border-t-transparent border-b-2 ${spinnerColors[color]}`}
        />
        
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-3 ${textColors[color]} font-medium`}
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingSpinner; 