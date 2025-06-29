'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSeating } from '../context/SeatingContext';
import { MapPosition } from '../types';

export default function SeatingMap() {
  const {
    tables,
    zoomLevel,
    mapPosition,
    boardDimensions,
    selectedTable,
    setSelectedTable,
    setShowTableDetailModal,
    setZoomLevel,
    setMapPosition,
    assignGuestToTable,
    setTables,
    isDragging,
    isTableDragging,
    draggedTable,
    setIsDragging,
    setIsTableDragging,
    setDraggedTable,
    removeGuestFromTable,
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

  // Mouse position tracking for drag
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  // Handle table drag start
  const handleTableDragStart = (e: React.MouseEvent, table: any) => {
    e.stopPropagation();
    setIsTableDragging(true);
    setDraggedTable(table);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle table drag
  const handleTableDrag = (e: React.MouseEvent) => {
    if (!isTableDragging || !draggedTable) return;
    
    const deltaX = (e.clientX - mousePosition.x) / zoomLevel;
    const deltaY = (e.clientY - mousePosition.y) / zoomLevel;
    
    const updatedTables = tables.map(table => 
      table.id === draggedTable.id 
        ? { ...table, x: Math.max(0, table.x + deltaX), y: Math.max(0, table.y + deltaY) }
        : table
    );
    
    setTables(updatedTables);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle table drag end
  const handleTableDragEnd = () => {
    setIsTableDragging(false);
    setDraggedTable(null);
  };

  // Handle map drag start
  const handleMapDragStart = (e: React.MouseEvent) => {
    if (isTableDragging) return;
    setIsDragging(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle map drag
  const handleMapDrag = (e: React.MouseEvent) => {
    if (!isDragging || isTableDragging) return;
    
    const deltaX = e.clientX - mousePosition.x;
    const deltaY = e.clientY - mousePosition.y;
    
    const newPosition: MapPosition = {
      x: mapPosition.x + deltaX,
      y: mapPosition.y + deltaY
    };
    setMapPosition(newPosition);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle map drag end
  const handleMapDragEnd = () => {
    setIsDragging(false);
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
          className={`relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden w-full select-none ${
            isDragging ? 'cursor-move' : 'cursor-default'
          }`}
          style={{ 
            height: '75vh',
            minHeight: '400px',
            maxHeight: '80vh'
          }}
          role="button"
          tabIndex={0}
          aria-label="מפת סידורי הושבה - גרור להזיז את המפה"
        onMouseDown={handleMapDragStart}
        onMouseMove={isTableDragging ? handleTableDrag : handleMapDrag}
        onMouseUp={() => {
          handleMapDragEnd();
          handleTableDragEnd();
        }}
        onMouseLeave={() => {
          handleMapDragEnd();
          handleTableDragEnd();
        }}
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
              } ${isTableDragging && draggedTable?.id === table.id ? 'ring-4 ring-purple-400' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isTableDragging) {
                  setSelectedTable(table);
                  setShowTableDetailModal(true);
                }
              }}
              onMouseDown={(e) => {
                // Only allow table dragging if not during a guest drop operation
                if (e.button === 0 && !e.ctrlKey) { // Left click only, no Ctrl
                  e.stopPropagation();
                  handleTableDragStart(e, table);
                }
              }}
              style={{
                left: table.x,
                top: table.y,
                width: table.shape === 'round' ? '120px' : '140px',
                height: table.shape === 'round' ? '120px' : '100px',
                cursor: isTableDragging && draggedTable?.id === table.id ? 'grabbing' : 'grab',
                zIndex: isTableDragging && draggedTable?.id === table.id ? 20 : 10,
                userSelect: 'none',
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
                  e.stopPropagation();
                  const guestData = e.dataTransfer.getData('application/json');
                  if (guestData) {
                    try {
                      const guest = JSON.parse(guestData);
                      assignGuestToTable(guest, table);
                    } catch (error) {
                      console.error('Error parsing guest data:', error);
                    }
                  }
                }}
                onDragOver={(e: React.DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
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
                      className="absolute group"
                      style={{
                        left: `calc(50% + ${x}px - 12px)`,
                        top: `calc(50% + ${y}px - 12px)`,
                      }}
                    >
                      {/* Guest Avatar */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                          guest.isCompanion 
                            ? 'bg-purple-500 text-white border border-purple-600' 
                            : guest.isConfirmed === true 
                              ? 'bg-green-500 text-white border border-green-600'
                              : guest.isConfirmed === null
                                ? 'bg-yellow-500 text-white border border-yellow-600'
                                : 'bg-red-500 text-white border border-red-600'
                        }`}
                        title={`${guest.name}${guest.isCompanion ? ' (מלווה)' : ''}`}
                      >
                        {guest.isCompanion ? '👥' : '👤'}
                      </div>
                      
                      {/* Remove Button - Shows on Hover */}
                      {!guest.isCompanion && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGuestFromTable(guest);
                          }}
                          className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center"
                          title={`הסר את ${guest.name} מהשולחן`}
                        >
                          ×
                        </button>
                      )}
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