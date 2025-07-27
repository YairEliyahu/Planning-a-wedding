'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventSetupData } from '../types';

interface EventSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventSetupData) => void;
  confirmedGuestsCount: number;
}

export default function EventSetupModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  confirmedGuestsCount 
}: EventSetupModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    onSubmit({
      guestCount: parseInt(formData.get('guestCount') as string),
      tableType: formData.get('tableType') as 'regular' | 'knight' | 'mix' | 'custom',
      customCapacity: formData.get('customCapacity') ? parseInt(formData.get('customCapacity') as string) : undefined,
      knightTablesCount: formData.get('knightTablesCount') ? parseInt(formData.get('knightTablesCount') as string) : undefined
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
              🎯 הגדרת אירוע חכמה
            </h3>
            <p className="text-gray-600 mb-6 font-[var(--font-heebo)]">
              בואו ניצור לכם פריסת שולחנות אופטימלית על בסיס רשימת האורחים שלכם
              {confirmedGuestsCount > 0 && (
                <span className="block mt-2 text-blue-600 font-medium">
                  ✨ זיהינו {confirmedGuestsCount} אורחים מאושרים ברשימה שלכם
                </span>
              )}
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1 font-[var(--font-heebo)]">
                    כמות אורחים באירוע
                  </label>
                  <input 
                    id="guestCount" 
                    name="guestCount" 
                    type="number" 
                    min="1" 
                    required 
                    defaultValue={confirmedGuestsCount > 0 ? confirmedGuestsCount.toString() : ''}
                    placeholder={confirmedGuestsCount > 0 ? `מומלץ: ${confirmedGuestsCount} אורחים מאושרים` : 'הזינו מספר אורחים'} 
                    className="w-full p-2 border border-gray-300 rounded-lg font-[var(--font-heebo)]"
                  />
                </div>
                
                <div>
                  <label htmlFor="tableType" className="block text-sm font-medium text-gray-700 mb-1 font-[var(--font-heebo)]">
                    סוג שולחנות
                  </label>
                  <select 
                    id="tableType" 
                    name="tableType" 
                    required 
                    className="w-full p-2 border border-gray-300 rounded-lg font-[var(--font-heebo)]"
                  >
                    <option value="">בחרו סוג שולחנות</option>
                    <option value="regular">שולחנות 12 איש (רגיל)</option>
                    <option value="knight">שולחנות 24 איש (אביר)</option>
                    <option value="mix">מיקס - שולחנות אביר + רגילים</option>
                    <option value="custom">בחירה אישית</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors font-[var(--font-heebo)]"
                >
                  ✨ צור פריסה מרוכזת
                </button>
                
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors font-[var(--font-heebo)]"
                >
                  ביטול
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 