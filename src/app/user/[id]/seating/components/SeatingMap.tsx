'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSeating } from '../context/SeatingContext';

export default function SeatingMap() {
  const {
    tables,
    zoomLevel,
    mapPosition,
    boardDimensions,
    selectedTable,
    setSelectedTable,
    setZoomLevel,
    setMapPosition,
    assignGuestToTable,
  } = useSeating();

  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel * 1.2, 3));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel / 1.2, 0.3));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setMapPosition({ x: 0, y: 0 });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 font-[var(--font-heebo)]">
          מפת השולחנות
        </h3>
        
        {/* Map Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="הקטן תצוגה"
            >
              <span className="text-lg">🔍-</span>
            </button>
            
            <span className="px-3 py-1 text-sm font-medium font-[var(--font-heebo)] min-w-[50px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <button
              onClick={zoomIn}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="הגדל תצוגה"
            >
              <span className="text-lg">🔍+</span>
            </button>
          </div>
          
          <button
            onClick={resetZoom}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-[var(--font-heebo)] text-sm"
            title="איפוס תצוגה"
          >
            🎯 איפוס
          </button>
        </div>
      </div>
      
      <div 
        className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden w-full select-none"
        style={{ 
          height: '75vh',
          minHeight: '400px',
          maxHeight: '80vh'
        }}
        role="application"
        aria-label="מפת סידורי הושבה"
      >
        <div 
          className="relative transition-transform duration-75 ease-out origin-top-left"
          style={{ 
            width: `${boardDimensions.width}px`, 
            height: `${boardDimensions.height}px`,
            transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0'
          }}
        >
          {tables.map((table) => (
            <motion.div
              key={table.id}
              className={`absolute ${
                selectedTable?.id === table.id ? 'ring-4 ring-blue-300' : ''
              }`}
              onClick={() => setSelectedTable(table)}
              style={{
                left: table.x,
                top: table.y,
                width: table.shape === 'round' ? '120px' : '140px',
                height: table.shape === 'round' ? '120px' : '100px',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <div 
                className={`w-full h-full border-4 shadow-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  table.shape === 'round' ? 'rounded-full' : 'rounded-xl'
                } bg-gradient-to-br from-white to-gray-50 border-gray-500 shadow-gray-200/50 ${
                  selectedTable?.id === table.id ? 'border-blue-500 ring-2 ring-blue-300 ring-opacity-50' : ''
                }`}
                onDrop={(e: React.DragEvent) => {
                  e.preventDefault();
                  const guestData = e.dataTransfer.getData('application/json');
                  if (guestData) {
                    const guest = JSON.parse(guestData);
                    assignGuestToTable(guest, table);
                  }
                }}
                onDragOver={(e: React.DragEvent) => e.preventDefault()}
              >
                <div className="text-center">
                  <div className="font-bold text-sm font-[var(--font-heebo)]">
                    {table.name}
                  </div>
                  <div className="text-xs font-[var(--font-heebo)] text-gray-500">
                    {table.guests.reduce((total, g) => total + g.numberOfGuests, 0)}/{table.capacity}
                  </div>
                </div>
                
                {/* Guest indicators around table */}
                {table.guests.map((guest, index) => {
                  const angle = (index / table.capacity) * 2 * Math.PI;
                  const radius = 50;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={guest._id}
                      className="absolute w-6 h-6 rounded-full flex items-center justify-center text-xs bg-blue-500 text-white"
                      style={{
                        left: `calc(50% + ${x}px - 12px)`,
                        top: `calc(50% + ${y}px - 12px)`,
                      }}
                      title={guest.name}
                    >
                      👤
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
          
          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 font-[var(--font-heebo)]">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-xl mb-2">בואו נתחיל בחכמה!</p>
                <p className="mb-4">השתמשו בהגדרת האירוע החכמה ליצירת פריסה אוטומטית</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}