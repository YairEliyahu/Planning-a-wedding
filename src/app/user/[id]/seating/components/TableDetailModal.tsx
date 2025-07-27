'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeating } from '../context/SeatingContext';

interface TableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TableDetailModal({ isOpen, onClose }: TableDetailModalProps) {
  const {
    selectedTable,
    tables,
    unassignedGuests,
    assignGuestToTable,
    removeGuestFromTable,
    getGuestStatusInfo,
  } = useSeating();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Clear search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);
  
  // Get the current table data to ensure real-time updates
  const currentTable = selectedTable ? tables.find(t => t.id === selectedTable.id) : null;

  if (!currentTable) return null;

  // Calculate occupied seats only from main guests (not companions)
  // Each main guest takes numberOfGuests seats
  const occupiedSeats = currentTable.guests
    .filter(guest => !guest.isCompanion) // Only count main guests
    .reduce((total, guest) => total + (guest.numberOfGuests || 1), 0);
  const availableSeats = currentTable.capacity - occupiedSeats;
  
  // Filter unassigned guests for search (confirmed + pending)
  const availableUnassignedGuests = unassignedGuests
    .filter(guest => guest.isConfirmed === true || guest.isConfirmed === null)
    .filter(guest => 
      searchQuery === '' || 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.side.includes(searchQuery)
    );

  const handleRemoveGuest = (guest: any) => {
    // Remove the main guest (this will also remove companions)
    const mainGuest = currentTable.guests.find(g => g._id === guest._id || g._id.startsWith(guest._id.split('-companion-')[0]));
    if (mainGuest && !mainGuest.isCompanion) {
      removeGuestFromTable(mainGuest);
    } else if (!guest.isCompanion) {
      removeGuestFromTable(guest);
    }
  };

  const handleAddGuest = (guest: any) => {
    assignGuestToTable(guest, currentTable);
    setSearchQuery(''); // Clear search after adding
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-[var(--font-heebo)]">
                    🪑 {currentTable.name}
                  </h2>
                  <p className="text-blue-100 mt-1 font-[var(--font-heebo)]">
                    {occupiedSeats}/{currentTable.capacity} מקומות תפוסים • {availableSeats} פנויים
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[70vh]">
              {/* Current Guests - Left Side */}
              <div className="lg:w-1/2 p-6 border-r border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
                  אורחים בשולחן ({currentTable.guests.filter(g => !g.isCompanion).length})
                </h3>
                
                {/* Visual Table Representation */}
                <div className="relative mx-auto mb-6 w-40 h-40">
                  <div 
                    className={`w-full h-full border-4 border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg flex items-center justify-center ${
                      currentTable.shape === 'round' ? 'rounded-full' : 'rounded-xl'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-sm font-[var(--font-heebo)]">
                        {currentTable.name}
                      </div>
                      <div className="text-xs text-gray-500 font-[var(--font-heebo)]">
                        {occupiedSeats}/{currentTable.capacity}
                      </div>
                    </div>

                    {/* Guest positions around table - with names */}
                    {currentTable.guests.map((guest, index) => {
                      const angle = (index / currentTable.capacity) * 2 * Math.PI;
                      const radius = 60;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      
                      return (
                        <div
                          key={guest._id}
                          className="absolute flex flex-col items-center"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          {/* Guest avatar */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-md ${
                              guest.isCompanion 
                                ? 'bg-purple-400 text-white' 
                                : guest.isConfirmed === true 
                                  ? 'bg-green-500 text-white'
                                  : guest.isConfirmed === null
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-red-500 text-white'
                            }`}
                            title={guest.name}
                          >
                            {guest.isCompanion ? '👥' : '👤'}
                          </div>
                          
                          {/* Guest name label */}
                          <div 
                            className="absolute top-10 bg-white text-gray-800 text-xs px-2 py-1 rounded shadow-md border min-w-max font-[var(--font-heebo)]"
                            style={{ 
                              fontSize: '10px',
                              maxWidth: '80px',
                              textAlign: 'center',
                              wordBreak: 'break-word'
                            }}
                          >
                            {guest.isCompanion 
                              ? `מלווה של ${guest.name.replace('מלווה של ', '')}`
                              : guest.name.length > 8 
                                ? `${guest.name.substring(0, 8)}...`
                                : guest.name
                            }
                            {guest.isConfirmed === null && (
                              <div className="text-yellow-600 text-xs">⏳ המתנה</div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty seat indicators */}
                    {Array.from({ length: currentTable.capacity - currentTable.guests.length }).map((_, index) => {
                      const totalOccupied = currentTable.guests.length;
                      const seatIndex = totalOccupied + index;
                      const angle = (seatIndex / currentTable.capacity) * 2 * Math.PI;
                      const radius = 60;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      
                      return (
                        <div
                          key={`empty-${index}`}
                          className="absolute w-6 h-6 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center"
                          style={{
                            left: `calc(50% + ${x}px - 12px)`,
                            top: `calc(50% + ${y}px - 12px)`,
                          }}
                          title="מקום פנוי"
                        >
                          <span className="text-gray-400 text-xs">○</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guests List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {currentTable.guests.filter(g => !g.isCompanion).map((guest) => {
                    const companions = currentTable.guests.filter(g => g.isCompanion && g._id.startsWith(guest._id));
                    
                    return (
                      <div key={guest._id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-medium font-[var(--font-heebo)]">{guest.name}</span>
                            <div className="text-xs text-gray-500 font-[var(--font-heebo)]">
                              {guest.side} • {guest.numberOfGuests} מקומות
                            </div>
                            {companions.length > 0 && (
                              <div className="text-xs text-blue-600 font-[var(--font-heebo)] mt-1">
                                + {companions.length} מלווים
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveGuest(guest)}
                            className="text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            title="הסר מהשולחן"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {currentTable.guests.filter(g => !g.isCompanion).length === 0 && (
                    <div className="text-center py-8 text-gray-500 font-[var(--font-heebo)]">
                      <div className="text-3xl mb-2">🪑</div>
                      <p>השולחן ריק</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Guests - Right Side */}
              <div className="lg:w-1/2 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
                  הוסף אורחים ({availableUnassignedGuests.length} זמינים)
                </h3>
                <div className="text-sm text-gray-600 mb-4 font-[var(--font-heebo)]">
                  ✅ מאושרים • ⏳ בהמתנה • 🚫 סירבו (לא זמינים)
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="חפש אורח..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-[var(--font-heebo)]"
                  />
                </div>

                {availableSeats > 0 && availableUnassignedGuests.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableUnassignedGuests.map((guest) => {
                      const statusInfo = getGuestStatusInfo(guest);
                      const canFit = guest.numberOfGuests <= availableSeats;
                      
                      return (
                        <div
                          key={guest._id}
                          className={`p-3 rounded-lg border transition-colors ${
                            canFit 
                              ? guest.isConfirmed === true
                                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium font-[var(--font-heebo)]">{guest.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color} ${statusInfo.bgColor}`}>
                                  {statusInfo.emoji}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 font-[var(--font-heebo)] mt-1">
                                {guest.side} • {guest.numberOfGuests} מקומות
                                {guest.isConfirmed === null && (
                                  <span className="text-yellow-600 mr-2">• בהמתנה</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddGuest(guest)}
                              disabled={!canFit}
                              className={`px-3 py-1 rounded text-sm font-[var(--font-heebo)] transition-colors ${
                                canFit
                                  ? guest.isConfirmed === true
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              title={canFit ? 'הוסף לשולחן' : 'לא מספיק מקום'}
                            >
                              {canFit ? '➕ הוסף' : '🚫'}
                            </button>
                          </div>
                          {!canFit && (
                            <div className="text-xs text-red-600 mt-1 font-[var(--font-heebo)]">
                              לא מספיק מקום
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {availableSeats === 0 && (
                  <div className="text-center py-8 text-gray-500 font-[var(--font-heebo)]">
                    <div className="text-3xl mb-2">🈵</div>
                    <p>השולחן מלא</p>
                  </div>
                )}

                {availableUnassignedGuests.length === 0 && availableSeats > 0 && (
                  <div className="text-center py-8 text-gray-500 font-[var(--font-heebo)]">
                    <div className="text-3xl mb-2">✅</div>
                    <p>כל האורחים הזמינים כבר הושבו</p>
                    <p className="text-xs mt-1">נותרו רק אורחים שסירבו</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-[var(--font-heebo)]"
              >
                סגור
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}