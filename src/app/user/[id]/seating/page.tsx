'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

interface Guest {
  _id: string;
  userId: string;
  name: string;
  phoneNumber?: string;
  numberOfGuests: number;
  side: 'חתן' | 'כלה' | 'משותף';
  isConfirmed: boolean | null;
  notes: string;
  group?: string;
  tableId?: string;
  seatNumber?: number;
  specialNeeds?: string;
}

interface ApiGuest {
  _id: string;
  userId: string;
  name: string;
  phoneNumber?: string;
  numberOfGuests: number;
  side: 'חתן' | 'כלה' | 'משותף';
  isConfirmed: boolean | null;
  notes: string;
  group?: string;
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

interface EventSetupData {
  guestCount: number;
  tableType: 'regular' | 'knight' | 'mix' | 'custom';
  customCapacity?: number;
  knightTablesCount?: number;
}

export default function SeatingArrangements() {
  const params = useParams();
  const userId = params.id as string;
  
  const [tables, setTables] = useState<Table[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [showEventSetupModal, setShowEventSetupModal] = useState(false);
  const [boardDimensions, setBoardDimensions] = useState({ width: 700, height: 600 });
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showTableDetailModal, setShowTableDetailModal] = useState(false);
  const [selectedTableForDetail, setSelectedTableForDetail] = useState<Table | null>(null);

  // Fetch real guest data
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/guests?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch guests');
        }
        
        const data = await response.json();
        
        if (data.success && data.guests) {
          // Transform guest data to match our interface - show ALL guests with status
          const transformedGuests: Guest[] = data.guests
            .map((guest: ApiGuest) => ({
              _id: guest._id,
              userId: guest.userId,
              name: guest.name,
              phoneNumber: guest.phoneNumber,
              numberOfGuests: guest.numberOfGuests || 1,
              side: guest.side,
              isConfirmed: guest.isConfirmed,
              notes: guest.notes || '',
              group: guest.group,
            }));
          
          setUnassignedGuests(transformedGuests);
          console.log(`Loaded ${transformedGuests.length} total guests`);
        } else {
          console.log('No guests found or API error');
          setUnassignedGuests([]);
        }
      } catch (error) {
        console.error('Error fetching guests:', error);
        setUnassignedGuests([]);
      } finally {
        setIsLoading(false);
        
        // Show event setup modal if no tables exist and guests are loaded
        setTimeout(() => {
          if (tables.length === 0) {
            setShowEventSetupModal(true);
          }
        }, 500);
      }
    };

    if (userId) {
      fetchGuests();
    }
  }, [userId, tables.length]);

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
    if (!guest.isConfirmed) {
      alert('ניתן להושיב רק אורחים שאישרו הגעה!');
      return;
    }
    
    if (table.guests.length >= table.capacity) {
      alert('השולחן מלא! לא ניתן להוסיף עוד אורחים');
      return;
    }

    // Remove guest from current table
    const updatedTables = tables.map(t => ({
      ...t,
      guests: t.guests.filter(g => g._id !== guest._id)
    }));

    // Add guest to new table
    const targetTable = updatedTables.find(t => t.id === table.id);
    if (targetTable) {
      targetTable.guests.push({ ...guest, tableId: table.id });
    }

    setTables(updatedTables);

    // Update unassigned guests
    setUnassignedGuests(prev => prev.filter(g => g._id !== guest._id));
  };

  const removeGuestFromTable = (guest: Guest) => {
    const updatedTables = tables.map(table => ({
      ...table,
      guests: table.guests.filter(g => g._id !== guest._id)
    }));
    setTables(updatedTables);
    setUnassignedGuests(prev => [...prev, { ...guest, tableId: undefined }]);
  };

  // Generate automatic table layout based on event details
  const generateTableLayout = (guestCount: number, tableType: string, customCapacity?: number, knightTablesCount?: number) => {
    const newTables: Table[] = [];
    let tablesNeeded = 0;
    
    // Calculate tables based on type
    if (tableType === 'regular') {
      tablesNeeded = Math.ceil(guestCount / 12);
      for (let i = 0; i < tablesNeeded; i++) {
        newTables.push({
          id: `table${i + 1}`,
          name: `שולחן ${i + 1}`,
          capacity: 12,
          shape: 'round',
          x: 0, // Will be positioned later
          y: 0,
          guests: []
        });
      }
    } else if (tableType === 'knight') {
      tablesNeeded = Math.ceil(guestCount / 24);
      for (let i = 0; i < tablesNeeded; i++) {
        newTables.push({
          id: `table${i + 1}`,
          name: `שולחן אביר ${i + 1}`,
          capacity: 24,
          shape: 'rectangular',
          x: 0,
          y: 0,
          guests: []
        });
      }
    } else if (tableType === 'mix') {
      const knightTables = knightTablesCount || 4;
      const knightCapacity = knightTables * 24;
      const remainingGuests = guestCount - knightCapacity;
      const regularTables = Math.max(0, Math.ceil(remainingGuests / 12));
      
      // Add knight tables
      for (let i = 0; i < knightTables; i++) {
        newTables.push({
          id: `knight${i + 1}`,
          name: `שולחן אביר ${i + 1}`,
          capacity: 24,
          shape: 'rectangular',
          x: 0,
          y: 0,
          guests: []
        });
      }
      
      // Add regular tables
      for (let i = 0; i < regularTables; i++) {
        newTables.push({
          id: `regular${i + 1}`,
          name: `שולחן ${i + 1}`,
          capacity: 12,
          shape: 'round',
          x: 0,
          y: 0,
          guests: []
        });
      }
      
      tablesNeeded = knightTables + regularTables;
    } else if (tableType === 'custom' && customCapacity) {
      tablesNeeded = Math.ceil(guestCount / customCapacity);
      for (let i = 0; i < tablesNeeded; i++) {
        newTables.push({
          id: `table${i + 1}`,
          name: `שולחן ${i + 1}`,
          capacity: customCapacity,
          shape: customCapacity > 16 ? 'rectangular' : 'round',
          x: 0,
          y: 0,
          guests: []
        });
      }
    }
    
    // Calculate grid layout and center positioning
    const cols = Math.ceil(Math.sqrt(tablesNeeded));
    const rows = Math.ceil(tablesNeeded / cols);
    
    // Table sizing
    const tableSize = 140;
    const spacing = 60;
    
    // Calculate total grid size
    const totalWidth = (cols * (tableSize + spacing)) - spacing;
    const totalHeight = (rows * (tableSize + spacing)) - spacing;
    
    // Adjust board dimensions with padding - only for the white map area
    const mapPadding = 60; // Padding within the white map area only
    const minMapWidth = 1800; // Very large minimum width to ensure horizontal scrolling on all screens
    const minMapHeight = 1200; // Very large minimum height to ensure vertical scrolling
    
    const newWidth = Math.max(minMapWidth, totalWidth + (mapPadding * 2));
    const newHeight = Math.max(minMapHeight, totalHeight + (mapPadding * 2));
    
    setBoardDimensions({ width: newWidth, height: newHeight });
    
    // Center the grid within the map area only
    const startX = (newWidth - totalWidth) / 2; // Center horizontally within map
    const startY = (newHeight - totalHeight) / 2; // Center vertically within map
    
    // Position tables in centered grid
    for (let i = 0; i < newTables.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      newTables[i].x = startX + (col * (tableSize + spacing));
      newTables[i].y = startY + (row * (tableSize + spacing));
    }
    
    return newTables;
  };

  const handleEventSetup = (eventData: EventSetupData) => {
    const generatedTables = generateTableLayout(
      eventData.guestCount,
      eventData.tableType,
      eventData.customCapacity,
      eventData.knightTablesCount
    );
    
    setTables(generatedTables);
    setShowEventSetupModal(false);
  };

  const clearAllTables = () => {
    setTables([]);
    setShowClearConfirmModal(false);
    // Move all assigned guests back to unassigned
    const allGuests = [
      ...unassignedGuests,
      ...tables.flatMap(table => table.guests.map(guest => ({ ...guest, tableId: undefined })))
    ];
    setUnassignedGuests(allGuests);
  };

  // Function to get guest status display info
  const getGuestStatusInfo = (guest: Guest) => {
    if (guest.isConfirmed === true) {
      return {
        text: 'מאושר',
        emoji: '✅',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (guest.isConfirmed === false) {
      return {
        text: 'סירב',
        emoji: '❌',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        text: 'ממתין',
        emoji: '⏳',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }
  };

  // Get available groups from confirmed guests
  const getAvailableGroups = () => {
    const confirmedGuests = unassignedGuests.filter(g => g.isConfirmed === true);
    const groups = confirmedGuests.map(g => g.group).filter(Boolean) as string[];
    return Array.from(new Set(groups)).sort();
  };

  // Get guests by side and group
  const getGuestsBySideAndGroup = (side: string, group: string) => {
    return unassignedGuests.filter(g => 
      g.isConfirmed === true && 
      g.side === side && 
      g.group === group
    );
  };

  // Auto-fill table with guests from specific category
  const autoFillTableByCategory = (table: Table, side: string, group: string, count: number) => {
    const availableGuests = getGuestsBySideAndGroup(side, group);
    const guestsToAdd = availableGuests.slice(0, Math.min(count, table.capacity - table.guests.length));
    
    guestsToAdd.forEach(guest => {
      assignGuestToTable(guest, table);
    });
  };

  // Open table detail modal
  const openTableDetail = (table: Table) => {
    setSelectedTableForDetail(table);
    setShowTableDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-[var(--font-heebo)]">טוען את רשימת האורחים...</p>
          <p className="mt-2 text-sm text-gray-500 font-[var(--font-heebo)]">מסנכרן עם מסד הנתונים</p>
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
                סדרו את האורחים סביב השולחנות • גררו שולחנות להזזתם
              </p>
            </div>
            
            <button
              onClick={() => setShowEventSetupModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-[var(--font-heebo)] mr-3"
            >
              🎯 הגדרת אירוע חכמה
            </button>
            
            {tables.length > 0 && (
              <button
                onClick={() => setShowClearConfirmModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-[var(--font-heebo)] mr-3"
              >
                🗑️ נקה כל השולחנות
              </button>
            )}
            
            <button
              onClick={() => setShowAddTableModal(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-[var(--font-heebo)]"
            >
              + הוסף שולחן
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Unassigned Guests Panel */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
                כל האורחים ({unassignedGuests.length})
                <div className="text-sm font-normal text-gray-600 mt-1">
                  {unassignedGuests.filter(g => g.isConfirmed === true).length} מאושרים • {' '}
                  {unassignedGuests.filter(g => g.isConfirmed === false).length} סירבו • {' '}
                  {unassignedGuests.filter(g => g.isConfirmed === null).length} ממתינים
                </div>
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unassignedGuests.map((guest) => {
                  const statusInfo = getGuestStatusInfo(guest);
                  const isAssignable = guest.isConfirmed === true;
                  
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
                        {isAssignable ? 'גרור לשולחן או לחץ כדי להקצות' : 'ניתן להושיב רק אורחים מאושרים'}
                      </div>
                    </div>
                  );
                })}
                
                {unassignedGuests.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-[var(--font-heebo)]">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="mb-2">אין אורחים ברשימה</p>
                    <p className="text-xs">נטען מסד הנתונים...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seating Chart */}
          <div className="lg:col-span-3 w-full order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
                מפת השולחנות
              </h3>
              
              <div 
                className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-96 overflow-scroll w-full"
                style={{ 
                  height: '75vh', // Use viewport height for better responsiveness
                  width: '100%', // Use full available width
                  minHeight: '400px', // Minimum height for small screens
                  maxHeight: '80vh', // Maximum height
                  overflowX: 'scroll',
                  overflowY: 'scroll'
                }}
              >
                <div 
                  className="relative"
                  style={{ 
                    width: `${boardDimensions.width}px`, 
                    height: `${boardDimensions.height}px`,
                    minWidth: `${boardDimensions.width}px`,
                    minHeight: `${boardDimensions.height}px`
                  }}
                >
                  {tables.map((table) => (
                    <motion.div
                      key={table.id}
                      className={`absolute ${
                        selectedTable?.id === table.id ? 'ring-4 ring-blue-300' : ''
                      } ${draggedTable?.id === table.id ? 'opacity-90 z-50' : 'z-10'}`}
                      style={{
                        left: table.x,
                        top: table.y,
                        width: table.shape === 'round' ? '120px' : table.capacity > 16 ? '160px' : '140px',
                        height: table.shape === 'round' ? '120px' : table.capacity > 16 ? '120px' : '100px',
                        cursor: draggedTable?.id === table.id ? 'grabbing' : 'grab',
                      }}
                      onClick={() => setSelectedTable(table)}
                      onDoubleClick={() => openTableDetail(table)}
                      onMouseDown={(e) => {
                        // Prevent event propagation to avoid board movement
                        e.stopPropagation();
                      }}
                      // Framer Motion drag functionality for moving tables
                      drag
                      dragMomentum={false}
                      dragElastic={0}
                      dragSnapToOrigin={false}
                      dragPropagation={false}
                      dragTransition={{ 
                        power: 0,
                        timeConstant: 0
                      }}
                      dragConstraints={{
                        left: 0,
                        right: boardDimensions.width - (table.capacity > 16 ? 160 : 140), // Dynamic constraint based on table size
                        top: 0,
                        bottom: boardDimensions.height - 120 // Dynamic constraint based on board height
                      }}
                      onDragStart={() => {
                        // Add visual feedback when starting to drag
                        setSelectedTable(table);
                        setDraggedTable(table);
                      }}
                      onDrag={(event, info) => {
                        // Real-time position tracking during drag for smoother experience
                        // This provides better visual feedback during dragging
                        console.log(`Dragging ${table.name} - Offset: ${info.offset.x}, ${info.offset.y}`);
                      }}
                      onDragEnd={(event, info) => {
                        // Update table position to exact drop location
                        const tableWidth = table.capacity > 16 ? 160 : 140;
                        const tableHeight = table.capacity > 16 ? 120 : (table.shape === 'round' ? 120 : 100);
                        
                        // Calculate the exact position where the table was dropped
                        let newX = table.x + info.offset.x;
                        let newY = table.y + info.offset.y;
                        
                        // Keep within bounds
                        newX = Math.max(0, Math.min(newX, boardDimensions.width - tableWidth));
                        newY = Math.max(0, Math.min(newY, boardDimensions.height - tableHeight));
                        
                        const updatedTables = tables.map(t => 
                          t.id === table.id ? { 
                            ...t, 
                            x: newX,
                            y: newY
                          } : t
                        );
                        setTables(updatedTables);
                        setDraggedTable(null);
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.05, ease: 'easeOut' },
                        boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.3)'
                      }}
                      whileDrag={{ 
                        scale: 1.1, 
                        zIndex: 1000,
                        rotateZ: 3,
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                        transition: { 
                          duration: 0.05,
                          ease: 'easeOut'
                        }
                      }}
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: draggedTable?.id === table.id ? 1.05 : 1,
                        transition: { duration: 0.1, ease: 'easeInOut' }
                      }}
                    >
                      <div 
                        className={`w-full h-full border-4 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          table.shape === 'round' ? 'rounded-full' : 'rounded-lg'
                        } ${table.capacity > 16 ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400' : 'bg-white border-gray-400'} ${
                          draggedTable?.id === table.id ? 'border-blue-500 bg-blue-50' : ''
                        } ${selectedTable?.id === table.id ? 'border-blue-400' : ''}`}
                        onClick={() => setSelectedTable(table)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedTable(table)}
                        onDrop={(e: React.DragEvent) => {
                          e.preventDefault();
                          const guestData = e.dataTransfer.getData('application/json');
                          if (guestData) {
                            const guest = JSON.parse(guestData);
                            assignGuestToTable(guest, table);
                          }
                        }}
                        onDragOver={(e: React.DragEvent) => e.preventDefault()}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="text-center">
                          <div className={`font-bold text-sm font-[var(--font-heebo)] transition-colors duration-200 ${
                            draggedTable?.id === table.id ? 'text-blue-700' : ''
                          }`}>
                            {table.name}
                          </div>
                          <div className={`text-xs font-[var(--font-heebo)] transition-colors duration-200 ${
                            table.capacity > 16 ? 'text-amber-600' : draggedTable?.id === table.id ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {table.guests.length}/{table.capacity}
                            {table.capacity > 16 && ' ♚'}
                            {draggedTable?.id === table.id && ' 🎯'}
                          </div>
                        </div>
                        
                        {/* Guest indicators around table */}
                        {table.guests.map((guest, index) => {
                          const angle = (index / table.capacity) * 2 * Math.PI;
                          const radius = table.shape === 'round' ? 70 : table.capacity > 16 ? 90 : 80;
                          const x = Math.cos(angle) * radius;
                          const y = Math.sin(angle) * radius;
                          
                          return (
                            <button
                              key={guest._id}
                              className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all duration-200 ${
                                table.capacity > 16 ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                              } ${draggedTable?.id === table.id ? 'scale-110 animate-pulse' : 'hover:scale-110'}`}
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
                            </button>
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
                        <button
                          onClick={() => setShowEventSetupModal(true)}
                          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-[var(--font-heebo)]"
                        >
                          🎯 הגדרת אירוע חכמה
                        </button>
                        <p className="text-sm text-gray-400 mt-4">או השתמשו ב&ldquo;הוסף שולחן&rdquo; ליצירה ידנית</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instruction text below the map */}
              {tables.length > 0 && (
                <div className="mt-3 text-center">
                  {draggedTable ? (
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-[var(--font-heebo)] animate-pulse">
                      🎯 גוררים את &ldquo;{draggedTable.name}&rdquo; - שחררו כדי למקם במקום החדש
                    </div>
                  ) : (
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-[var(--font-heebo)]">
                      💡 גררו שולחנות להזזתם • גררו אורחים מהרשימה לשולחנות • לחיצה כפולה על שולחן להדמייה מפורטת
                    </div>
                  )}
                </div>
              )}
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
                    <div key={guest._id} className="flex items-center justify-between text-sm">
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{tables.length}</div>
            <div className="text-gray-600 font-[var(--font-heebo)]">שולחנות</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tables.reduce((sum, table) => sum + table.guests.length, 0)}
            </div>
            <div className="text-gray-600 font-[var(--font-heebo)]">אורחים מושבים</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {unassignedGuests.filter(g => g.isConfirmed === true).length}
            </div>
            <div className="text-gray-600 font-[var(--font-heebo)]">מאושרים ללא שולחן</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {unassignedGuests.filter(g => g.isConfirmed === false).length}
            </div>
            <div className="text-gray-600 font-[var(--font-heebo)]">סירבו</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {unassignedGuests.filter(g => g.isConfirmed === null).length}
            </div>
            <div className="text-gray-600 font-[var(--font-heebo)]">ממתינים לתשובה</div>
          </div>
        </div>
      </div>

      {/* Event Setup Modal */}
      <AnimatePresence>
        {showEventSetupModal && (
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
                הזינו את פרטי האירוע ואנחנו ניצור עבורכם פריסת שולחנות אופטימלית ומרוכזת
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEventSetup({
                  guestCount: parseInt(formData.get('guestCount') as string),
                  tableType: formData.get('tableType') as 'regular' | 'knight' | 'mix' | 'custom',
                  customCapacity: formData.get('customCapacity') ? parseInt(formData.get('customCapacity') as string) : undefined,
                  knightTablesCount: formData.get('knightTablesCount') ? parseInt(formData.get('knightTablesCount') as string) : undefined
                });
              }}>
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
                      placeholder="הזינו מספר אורחים" 
                      className="w-full p-2 border border-gray-300 rounded-lg font-[var(--font-heebo)]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tableType" className="block text-sm font-medium text-gray-700 mb-1 font-[var(--font-heebo)]">
                      סוג שולחנות
                    </label>
                    <select id="tableType" name="tableType" required className="w-full p-2 border border-gray-300 rounded-lg font-[var(--font-heebo)]" onChange={(e) => {
                      // Show/hide conditional fields based on selection
                      const customField = document.getElementById('customCapacityDiv');
                      const knightField = document.getElementById('knightTablesDiv');
                      
                      if (e.target.value === 'custom') {
                        customField?.style.setProperty('display', 'block');
                      } else {
                        customField?.style.setProperty('display', 'none');
                      }
                      
                      if (e.target.value === 'mix') {
                        knightField?.style.setProperty('display', 'block');
                      } else {
                        knightField?.style.setProperty('display', 'none');
                      }
                    }}>
                      <option value="">בחרו סוג שולחנות</option>
                      <option value="regular">שולחנות 12 איש (רגיל)</option>
                      <option value="knight">שולחנות 24 איש (אביר)</option>
                      <option value="mix">מיקס - שולחנות אביר + רגילים</option>
                      <option value="custom">בחירה אישית</option>
                    </select>
                  </div>
                  
                  <div id="customCapacityDiv" style={{ display: 'none' }}>
                    <label htmlFor="customCapacity" className="block text-sm font-medium text-gray-700 mb-1 font-[var(--font-heebo)]">
                      כמות אנשים בשולחן (בחירה אישית)
                    </label>
                    <input 
                      id="customCapacity" 
                      name="customCapacity" 
                      type="number" 
                      min="4" 
                      max="30" 
                      placeholder="הזינו מספר מקומות בשולחן"
                      className="w-full p-2 border border-gray-300 rounded-lg font-[var(--font-heebo)]"
                    />
                  </div>
                  
                  <div id="knightTablesDiv" style={{ display: 'none' }}>
                    <label htmlFor="knightTablesCount" className="block text-sm font-medium text-gray-700 mb-1 font-[var(--font-heebo)]">
                      כמה שולחנות אביר (24 איש)?
                    </label>
                    <select id="knightTablesCount" name="knightTablesCount" className="w-full p-2 border border-gray-300 rounded-lg font-[var(--font-heebo)]">
                      <option value="3">3 שולחנות אביר</option>
                      <option value="4" selected>4 שולחנות אביר (מומלץ)</option>
                      <option value="5">5 שולחנות אביר</option>
                      <option value="6">6 שולחנות אביר</option>
                      <option value="7">7 שולחנות אביר</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1 font-[var(--font-heebo)]">
                      השאר יהיו שולחנות רגילים של 12 איש
                    </p>
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
                    onClick={() => setShowEventSetupModal(false)}
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

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddTableModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Tables Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirmModal && (
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
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 font-[var(--font-heebo)]">
                  מחיקת כל השולחנות
                </h3>
                <p className="text-gray-600 mb-6 font-[var(--font-heebo)]">
                  האם אתם בטוחים שברצונכם למחוק את כל השולחנות?<br/>
                  <strong>פעולה זו תמחק {tables.length} שולחנות ותחזיר את כל האורחים לרשימה הלא מוקצית.</strong>
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm font-[var(--font-heebo)]">
                    ⚠️ <strong>אזהרה:</strong> פעולה זו אינה ניתנת לביטול!
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={clearAllTables}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors font-[var(--font-heebo)]"
                >
                  🗑️ כן, מחק הכל
                </button>
                
                <button
                  onClick={() => setShowClearConfirmModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors font-[var(--font-heebo)]"
                >
                  ביטול
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Detail Modal - Advanced Seating Visualization */}
      <AnimatePresence>
        {showTableDetailModal && selectedTableForDetail && (
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
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 font-[var(--font-heebo)]">
                  🪑 הדמיית {selectedTableForDetail.name}
                </h3>
                <button
                  onClick={() => setShowTableDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Table Visualization */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-bold mb-4 text-center font-[var(--font-heebo)]">
                    הדמיית השולחן ({selectedTableForDetail.guests.length}/{selectedTableForDetail.capacity})
                  </h4>
                  
                  <div className="relative flex items-center justify-center">
                    {/* Table Shape */}
                    <div 
                      className={`relative ${
                        selectedTableForDetail.shape === 'round' ? 'rounded-full' : 'rounded-lg'
                      } bg-gradient-to-br from-amber-100 to-amber-200 border-4 border-amber-400 shadow-lg`}
                      style={{
                        width: selectedTableForDetail.capacity > 16 ? '280px' : '240px',
                        height: selectedTableForDetail.shape === 'round' ? 
                          (selectedTableForDetail.capacity > 16 ? '280px' : '240px') : 
                          (selectedTableForDetail.capacity > 16 ? '180px' : '160px')
                      }}
                    >
                      {/* Table Name in Center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="font-bold text-lg text-amber-800 font-[var(--font-heebo)]">
                            {selectedTableForDetail.name}
                          </div>
                          <div className="text-sm text-amber-600 font-[var(--font-heebo)]">
                            {selectedTableForDetail.capacity} מקומות
                          </div>
                        </div>
                      </div>

                      {/* Seats around the table */}
                      {Array.from({ length: selectedTableForDetail.capacity }).map((_, seatIndex) => {
                        const angle = (seatIndex / selectedTableForDetail.capacity) * 2 * Math.PI;
                        const radius = selectedTableForDetail.shape === 'round' ? 
                          (selectedTableForDetail.capacity > 16 ? 160 : 140) : 
                          (selectedTableForDetail.capacity > 16 ? 120 : 100);
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        
                        const guestAtSeat = selectedTableForDetail.guests.find(g => g.seatNumber === seatIndex + 1) || 
                                           selectedTableForDetail.guests[seatIndex];
                        
                        return (
                          <div
                            key={seatIndex}
                            className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer transition-all duration-200 ${
                              guestAtSeat 
                                ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' 
                                : 'bg-gray-200 text-gray-500 border-gray-300 hover:bg-gray-300'
                            }`}
                            style={{
                              left: `calc(50% + ${x}px - 24px)`,
                              top: `calc(50% + ${y}px - 24px)`,
                            }}
                            title={guestAtSeat ? `${guestAtSeat.name} (${guestAtSeat.side})` : `מקום ${seatIndex + 1} - פנוי`}
                            onClick={() => {
                              if (guestAtSeat) {
                                removeGuestFromTable(guestAtSeat);
                              }
                            }}
                          >
                            {guestAtSeat ? '👤' : (seatIndex + 1)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Auto-Fill Controls */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold font-[var(--font-heebo)]">
                    🎯 מילוי אוטומטי לפי קטגוריה
                  </h4>
                  
                  {getAvailableGroups().length > 0 ? (
                    <div className="space-y-4">
                      {/* Side Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                          בחרו צד:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['חתן', 'כלה', 'משותף'].map(side => (
                            <button
                              key={side}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-[var(--font-heebo)] text-sm"
                              onClick={() => {
                                // This will be used for filtering
                              }}
                            >
                              {side}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Group Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-[var(--font-heebo)]">
                          בחרו קבוצה:
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {getAvailableGroups().map(group => (
                            <div key={group} className="border rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium font-[var(--font-heebo)]">{group}</span>
                              </div>
                              
                              {/* Show available guests by side */}
                              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                {['חתן', 'כלה', 'משותף'].map(side => {
                                  const count = getGuestsBySideAndGroup(side, group).length;
                                  return (
                                    <button
                                      key={`${group}-${side}`}
                                      className={`px-2 py-1 rounded ${
                                        count > 0 
                                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      } font-[var(--font-heebo)]`}
                                      disabled={count === 0}
                                      onClick={() => {
                                        if (count > 0) {
                                          const availableSeats = selectedTableForDetail.capacity - selectedTableForDetail.guests.length;
                                          const guestsToAdd = Math.min(count, availableSeats);
                                          autoFillTableByCategory(selectedTableForDetail, side, group, guestsToAdd);
                                        }
                                      }}
                                    >
                                      {side}: {count}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 font-[var(--font-heebo)]">
                      <div className="text-4xl mb-2">📝</div>
                      <p>אין קבוצות זמינות</p>
                      <p className="text-xs mt-1">הוסיפו קבוצות לאורחים במסד הנתונים</p>
                    </div>
                  )}

                  {/* Current Guests List */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3 font-[var(--font-heebo)]">
                      אורחים בשולחן ({selectedTableForDetail.guests.length}):
                    </h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedTableForDetail.guests.map((guest, index) => (
                        <div key={guest._id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <div className="font-[var(--font-heebo)]">
                            <span className="font-medium">{guest.name}</span>
                            <span className="text-gray-500 text-xs ml-2">
                              {guest.side}{guest.group && ` • ${guest.group}`}
                            </span>
                          </div>
                          <button
                            onClick={() => removeGuestFromTable(guest)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            הסר
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowTableDetailModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-[var(--font-heebo)]"
                >
                  סגור
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 