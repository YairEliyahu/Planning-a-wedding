'use client';

import { useSync } from '@/contexts/SyncContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SyncIndicator() {
  const { isConnected, lastSync, connectionStatus } = useSync();
  const [showIndicator, setShowIndicator] = useState(false);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  // Show sync indicator when receiving updates
  useEffect(() => {
    if (lastSync) {
      setShowIndicator(true);
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSync]);

  // Show connection status on hover
  const handleMouseEnter = () => setShowConnectionStatus(true);
  const handleMouseLeave = () => setShowConnectionStatus(false);

  if (!isConnected) return null;

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'מחובר לפרטנר';
      case 'connecting':
        return 'מתחבר...';
      case 'error':
        return 'שגיאת חיבור';
      default:
        return 'מנותק';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Sync notification */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg mb-3"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="animate-pulse">🔄</span>
              <span>עדכון מהפרטנר</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection status indicator */}
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`w-4 h-4 rounded-full ${getStatusColor()} shadow-lg cursor-pointer transition-all duration-300 hover:scale-110`} />
        
        {/* Connection status tooltip */}
        <AnimatePresence>
          {showConnectionStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-6 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg"
            >
              {getStatusText()}
              <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 