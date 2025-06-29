'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeating } from '../context/SeatingContext';

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTableModal({ isOpen, onClose }: AddTableModalProps) {
  const { addNewTable } = useSeating();
  
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [shape, setShape] = useState<'round' | 'rectangular'>('round');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableName.trim()) {
      alert('נא להזין שם לשולחן');
      return;
    }

    if (capacity < 2 || capacity > 20) {
      alert('קיבולת השולחן צריכה להיות בין 2 ל-20 מקומות');
      return;
    }

    addNewTable({
      name: tableName.trim(),
      capacity,
      shape,
    });

    // Reset form
    setTableName('');
    setCapacity(8);
    setShape('round');
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setTableName('');
    setCapacity(8);
    setShape('round');
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
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-[var(--font-heebo)]">
                  🪑 הוסף שולחן חדש
                </h2>
                <button
                  onClick={handleClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Table Name */}
              <div>
                <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  שם השולחן
                </label>
                <input
                  id="tableName"
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="לדוגמה: שולחן 1, משפחת כהן..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-[var(--font-heebo)]"
                  required
                />
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  קיבולת השולחן
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="capacity"
                    type="range"
                    min="2"
                    max="20"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{capacity}</span>
                    <span className="text-sm text-gray-500 font-[var(--font-heebo)]">מקומות</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-[var(--font-heebo)]">
                  מספר המקומות שיכול להכיל השולחן
                </div>
              </div>

              {/* Shape */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  צורת השולחן
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShape('round')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      shape === 'round'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                      <span className="text-sm font-[var(--font-heebo)]">עגול</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShape('rectangular')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      shape === 'rectangular'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-8 mx-auto mb-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
                      <span className="text-sm font-[var(--font-heebo)]">מלבני</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">תצוגה מקדימה:</h4>
                <div className="flex items-center justify-center">
                  <div 
                    className={`border-4 border-gray-400 bg-gradient-to-br from-white to-gray-50 shadow-lg flex items-center justify-center ${
                      shape === 'round' ? 'rounded-full w-20 h-20' : 'rounded-xl w-24 h-16'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-xs font-[var(--font-heebo)]">
                        {tableName || 'שם השולחן'}
                      </div>
                      <div className="text-xs text-gray-500 font-[var(--font-heebo)]">
                        0/{capacity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-[var(--font-heebo)]"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-[var(--font-heebo)]"
                >
                  ➕ הוסף שולחן
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 