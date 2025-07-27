'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Guest } from '../types';

interface UnassignedGuestsListProps {
  guests: Guest[];
  getGuestStatusInfo: (guest: Guest) => {
    text: string;
    emoji: string;
    color: string;
    bgColor: string;
    borderColor: string;
  };
}

export default function UnassignedGuestsList({ guests, getGuestStatusInfo }: UnassignedGuestsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
        כל האורחים ({guests.length})
        <div className="text-sm font-normal text-gray-600 mt-1">
          {guests.filter(g => g.isConfirmed === true).length} מאושרים • {' '}
          {guests.filter(g => g.isConfirmed === false).length} סירבו • {' '}
          {guests.filter(g => g.isConfirmed === null).length} ממתינים
        </div>
        <div className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
          💡 גרור אורחים מאושרים או בהמתנה לשולחנות • לחץ על שולחן לפרטים נוספים
        </div>
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {guests.map((guest) => {
          const statusInfo = getGuestStatusInfo(guest);
          const isAssignable = guest.isConfirmed === true || guest.isConfirmed === null;
          
          return (
            <div
              key={guest._id}
              className={`p-3 rounded-lg border transition-colors ${statusInfo.bgColor} ${statusInfo.borderColor} ${
                isAssignable ? 'cursor-move hover:bg-opacity-80' : 'cursor-not-allowed opacity-75'
              }`}
              draggable={isAssignable}
              onDragStart={(e: React.DragEvent) => {
                if (isAssignable) {
                  e.dataTransfer.setData('application/json', JSON.stringify(guest));
                  e.dataTransfer.effectAllowed = 'move';
                } else {
                  e.preventDefault();
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-gray-600">👤</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium font-[var(--font-heebo)] block">{guest.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color} ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                      {statusInfo.emoji} {statusInfo.text}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-[var(--font-heebo)] flex gap-2 mt-1">
                    <span>{guest.side}</span>
                    {guest.group && (
                      <span>• {guest.group}</span>
                    )}
                    {guest.numberOfGuests > 1 && (
                      <span>• {guest.numberOfGuests} אורחים</span>
                    )}
                  </div>
                </div>
              </motion.div>
              <div className="text-xs text-gray-400 mt-1 font-[var(--font-heebo)]">
                {isAssignable ? (
                  'גרור לשולחן כדי להושיב'
                ) : (
                  'ניתן להושיב רק אורחים מאושרים או בהמתנה'
                )}
              </div>
            </div>
          );
        })}
        
        {guests.length === 0 && (
          <div className="text-center py-8 text-gray-500 font-[var(--font-heebo)]">
            <div className="text-4xl mb-2">👥</div>
            <p className="mb-2">אין אורחים ברשימה</p>
            <p className="text-xs">נטען מסד הנתונים...</p>
          </div>
        )}
      </div>
    </div>
  );
} 