'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeating } from '../context/SeatingContext';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClearConfirmModal({ isOpen, onClose }: ClearConfirmModalProps) {
  const { tables, clearAllTables } = useSeating();

  const totalGuests = tables.reduce((sum, table) => 
    sum + table.guests.filter(g => !g.isCompanion).length, 0
  );
  
  const totalSeats = tables.reduce((sum, table) => 
    sum + table.guests.reduce((guestSum, guest) => guestSum + (guest.numberOfGuests || 1), 0), 0
  );

  const handleConfirm = () => {
    clearAllTables();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-[var(--font-heebo)]">
                  🗑️ נקה את כל השולחנות
                </h2>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 font-[var(--font-heebo)]">
                  האם אתה בטוח?
                </h3>
                <p className="text-gray-600 font-[var(--font-heebo)]">
                  פעולה זו תמחק את כל השולחנות וההושבה הנוכחית
                </p>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-800 mb-2 font-[var(--font-heebo)]">
                  מה ימחק:
                </h4>
                <div className="space-y-2 text-sm font-[var(--font-heebo)]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">שולחנות:</span>
                    <span className="font-medium text-red-600">
                      {tables.length} שולחנות
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">אורחים מושבים:</span>
                    <span className="font-medium text-red-600">
                      {totalGuests} אורחים ({totalSeats} מקומות)
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-500">⚠️</span>
                  <div className="text-sm text-yellow-800 font-[var(--font-heebo)]">
                    <p className="font-medium mb-1">שים לב:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>כל האורחים יחזרו לרשימה הלא מושבת</li>
                      <li>כל השולחנות ימחקו לחלוטין</li>
                      <li>לא ניתן לבטל פעולה זו</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-[var(--font-heebo)]"
                >
                  ביטול
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-[var(--font-heebo)]"
                >
                  🗑️ מחק הכל
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 