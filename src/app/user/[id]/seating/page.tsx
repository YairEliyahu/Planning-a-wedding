'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

interface Guest {
  id: string;
  name: string;
  status: 'confirmed' | 'declined' | 'pending';
  tableId?: string;
  seatNumber?: number;
  specialNeeds?: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular';
  x: number;
  y: number;
  guests: Guest[];
}

export default function SeatingArrangements() {
  // const params = useParams(); // Commented out until needed
  
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for development
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const mockGuests: Guest[] = [
        { id: '1', name: 'יוסי כהן', status: 'confirmed' },
        { id: '2', name: 'רחל לוי', status: 'confirmed' },
        { id: '3', name: 'דוד שמואל', status: 'confirmed' },
        { id: '4', name: 'שרה מלכה', status: 'confirmed' },
        { id: '5', name: 'אבי ניסן', status: 'confirmed' },
        { id: '6', name: 'מירב דוד', status: 'confirmed' },
        { id: '7', name: 'משה ברוך', status: 'confirmed' },
        { id: '8', name: 'נעה יוסף', status: 'confirmed' },
      ];

      const mockTables: Table[] = [
        {
          id: 'table1',
          name: 'שולחן 1 - משפחה',
          capacity: 8,
          shape: 'round',
          x: 100,
          y: 100,
          guests: []
        },
        {
          id: 'table2',
          name: 'שולחן 2 - חברים',
          capacity: 6,
          shape: 'rectangular',
          x: 300,
          y: 150,
          guests: []
        }
      ];

      setGuests(mockGuests);
      setTables(mockTables);
      setUnassignedGuests(mockGuests);
      setIsLoading(false);
    }, 1000);
  }, []);

  const addNewTable = () => {
    const newTable: Table = {
      id: `table${tables.length + 1}`,
      name: `שולחן ${tables.length + 1}`,
      capacity: 8,
      shape: 'round',
      x: 200 + (tables.length * 50),
      y: 200 + (tables.length * 50),
      guests: []
    };
    setTables([...tables, newTable]);
    setShowAddTableModal(false);
  };

  const assignGuestToTable = (guest: Guest, table: Table) => {
    if (table.guests.length >= table.capacity) {
      alert('השולחן מלא! לא ניתן להוסיף עוד אורחים');
      return;
    }

    // Remove guest from current table
    const updatedTables = tables.map(t => ({
      ...t,
      guests: t.guests.filter(g => g.id !== guest.id)
    }));

    // Add guest to new table
    const targetTable = updatedTables.find(t => t.id === table.id);
    if (targetTable) {
      targetTable.guests.push({ ...guest, tableId: table.id });
    }

    setTables(updatedTables);

    // Update unassigned guests
    setUnassignedGuests(prev => prev.filter(g => g.id !== guest.id));
  };

  const removeGuestFromTable = (guest: Guest) => {
    const updatedTables = tables.map(table => ({
      ...table,
      guests: table.guests.filter(g => g.id !== guest.id)
    }));
    setTables(updatedTables);
    setUnassignedGuests(prev => [...prev, { ...guest, tableId: undefined }]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-[var(--font-heebo)]">טוען סידורי הושבה...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 font-[var(--font-heebo)]">
                🪑 סידורי הושבה
              </h1>
              <p className="text-gray-600 mt-1 font-[var(--font-heebo)]">
                סדרו את האורחים סביב השולחנות
              </p>
            </div>
            
            <button
              onClick={() => setShowAddTableModal(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-[var(--font-heebo)]"
            >
              + הוסף שולחן
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Unassigned Guests Panel */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
                אורחים ללא שולחן ({unassignedGuests.length})
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unassignedGuests.map((guest) => (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move"
                    draggable
                    onDragStart={(e: React.DragEvent) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(guest));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">👤</span>
                      <span className="font-medium font-[var(--font-heebo)]">{guest.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-[var(--font-heebo)]">
                      גרור לשולחן או לחץ כדי להקצות
                    </div>
                  </motion.div>
                ))}
                
                {unassignedGuests.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-[var(--font-heebo)]">
                    כל האורחים הוקצו לשולחנות
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seating Chart */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
                מפת השולחנות
              </h3>
              
              <div 
                className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-96"
                style={{ height: '600px' }}
              >
                {tables.map((table) => (
                  <motion.div
                    key={table.id}
                    className={`absolute cursor-pointer transition-all duration-200 ${
                      selectedTable?.id === table.id ? 'ring-4 ring-blue-300' : ''
                    }`}
                    style={{
                      left: table.x,
                      top: table.y,
                      width: table.shape === 'round' ? '120px' : '140px',
                      height: table.shape === 'round' ? '120px' : '100px',
                    }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedTable(table)}
                  >
                    <div 
                      className={`w-full h-full border-4 border-gray-400 bg-white shadow-lg flex items-center justify-center cursor-pointer ${
                        table.shape === 'round' ? 'rounded-full' : 'rounded-lg'
                      }`}
                      onClick={() => setSelectedTable(table)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedTable(table)}
                      role="button"
                      tabIndex={0}
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
                      {/* Table Shape */}
                      <div 
                        className={`w-full h-full border-4 border-gray-400 bg-white shadow-lg flex items-center justify-center ${
                          table.shape === 'round' ? 'rounded-full' : 'rounded-lg'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold text-sm font-[var(--font-heebo)]">
                            {table.name}
                          </div>
                          <div className="text-xs text-gray-500 font-[var(--font-heebo)]">
                            {table.guests.length}/{table.capacity}
                          </div>
                        </div>
                      </div>
                      
                      {/* Guest indicators around table */}
                      {table.guests.map((guest, index) => {
                        const angle = (index / table.capacity) * 2 * Math.PI;
                        const radius = table.shape === 'round' ? 70 : 80;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        
                        return (
                          <div
                            key={guest.id}
                            className="absolute w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-blue-600"
                            style={{
                              left: `calc(50% + ${x}px - 16px)`,
                              top: `calc(50% + ${y}px - 16px)`,
                            }}
                            title={guest.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGuestFromTable(guest);
                            }}
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
                      <div className="text-6xl mb-4">🪑</div>
                      <p className="text-xl mb-2">אין שולחנות עדיין</p>
                      <p>לחצו על &ldquo;הוסף שולחן&rdquo; כדי להתחיל</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Table Details */}
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
              פרטי {selectedTable.name}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 font-[var(--font-heebo)]">
                  <strong>כמות מקומות:</strong> {selectedTable.capacity}
                </p>
                <p className="text-gray-600 font-[var(--font-heebo)]">
                  <strong>מקומות תפוסים:</strong> {selectedTable.guests.length}
                </p>
                <p className="text-gray-600 font-[var(--font-heebo)]">
                  <strong>צורת שולחן:</strong> {selectedTable.shape === 'round' ? 'עגול' : 'מלבני'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2 font-[var(--font-heebo)]">
                  אורחים בשולחן:
                </h4>
                <div className="space-y-1">
                  {selectedTable.guests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between text-sm">
                      <span className="font-[var(--font-heebo)]">{guest.name}</span>
                      <button
                        onClick={() => removeGuestFromTable(guest)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        הסר
                      </button>
                    </div>
                  ))}
                  
                  {selectedTable.guests.length === 0 && (
                    <p className="text-gray-500 text-sm font-[var(--font-heebo)]">
                      אין אורחים בשולחן זה
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{tables.length}</div>
            <div className="text-gray-600 font-[var(--font-heebo)]">שולחנות</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tables.reduce((sum, table) => sum + table.guests.length, 0)}
            </div>
            <div className="text-gray-600 font-[var(--font-heebo)]">אורחים מוקצים</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{unassignedGuests.length}</div>
            <div className="text-gray-600 font-[var(--font-heebo)]">ללא שולחן</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tables.reduce((sum, table) => sum + table.capacity, 0)}
            </div>
            <div className="text-gray-600 font-[var(--font-heebo)]">סה״כ מקומות</div>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold mb-4 font-[var(--font-heebo)]">הוסף שולחן חדש</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  שם השולחן
                </label>
                <input
                  id="tableName"
                  type="text"
                  defaultValue={`שולחן ${tables.length + 1}`}
                  className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]"
                />
              </div>
              
              <div>
                <label htmlFor="tableCapacity" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  כמות מקומות
                </label>
                <select id="tableCapacity" className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]">
                  <option value="4">4 מקומות</option>
                  <option value="6">6 מקומות</option>
                  <option value="8">8 מקומות</option>
                  <option value="10">10 מקומות</option>
                  <option value="12">12 מקומות</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="tableShape" className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                  צורת שולחן
                </label>
                <select id="tableShape" className="w-full p-2 border border-gray-300 rounded-md font-[var(--font-heebo)]">
                  <option value="round">עגול</option>
                  <option value="rectangular">מלבני</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addNewTable}
                className="flex-1 bg-blue-500 text-white py-2 rounded-md font-[var(--font-heebo)] hover:bg-blue-600"
              >
                הוסף שולחן
              </button>
              
              <button
                onClick={() => setShowAddTableModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-[var(--font-heebo)] hover:bg-gray-400"
              >
                ביטול
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 