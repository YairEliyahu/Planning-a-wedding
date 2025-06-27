'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  SeatingContextType, 
  Table, 
  Guest, 
  EventSetupData, 
  SeatingArrangement,
  MapPosition, 
  BoardDimensions,
  SideFilter,
  StatusFilter
} from '../types';
import { guestService, guestKeys } from '../services/guestService';
import { seatingService, seatingKeys } from '../services/seatingService';

const SeatingContext = createContext<SeatingContextType | null>(null);

interface SeatingProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function SeatingProvider({ children, userId }: SeatingProviderProps) {
  const queryClient = useQueryClient();

  // Local state
  const [tables, setTables] = useState<Table[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedTableForDetail, setSelectedTableForDetail] = useState<Table | null>(null);
  const [confirmedGuestsCount, setConfirmedGuestsCount] = useState(0);
  const [hasShownEventSetup, setHasShownEventSetup] = useState(false);
  
  // Map controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapPosition, setMapPosition] = useState<MapPosition>({ x: 0, y: 0 });
  const [boardDimensions, setBoardDimensions] = useState<BoardDimensions>({ width: 700, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isTableDragging, setIsTableDragging] = useState(false);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  
  // Modal states
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showEventSetupModal, setShowEventSetupModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showTableDetailModal, setShowTableDetailModal] = useState(false);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<SideFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Load map view state from localStorage
  useEffect(() => {
    const savedView = seatingService.loadMapViewState();
    if (savedView) {
      setZoomLevel(savedView.zoom || 1);
      setMapPosition(savedView.position || { x: 0, y: 0 });
    }
  }, []);

  // Save map view state when it changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      seatingService.saveMapViewState(zoomLevel, mapPosition);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [zoomLevel, mapPosition]);

  // Fetch guests query
  const { 
    data: guestsData, 
    isLoading: isGuestsLoading,
  } = useQuery({
    queryKey: guestKeys.byUser(userId),
    queryFn: () => guestService.fetchGuests(userId),
    enabled: !!userId,
  });

  // Fetch seating arrangement query
  const { 
    data: seatingData, 
    isLoading: isSeatingLoading,
  } = useQuery({
    queryKey: seatingKeys.byUser(userId),
    queryFn: () => seatingService.fetchSeatingArrangement(userId),
    enabled: !!userId,
  });

  // Save seating arrangement mutation
  const saveSeatingMutation = useMutation({
    mutationFn: (data: { arrangement: SeatingArrangement; tables: Table[] }) =>
      seatingService.saveSeatingArrangement({
        userId,
        arrangement: data.arrangement,
        tables: data.tables
      }),
    onSuccess: (result) => {
      alert(result.data.message || 'סידור ההושבה נשמר בהצלחה!');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: seatingKeys.byUser(userId) });
    },
    onError: (error) => {
      console.error('Error saving seating arrangement:', error);
      alert('שגיאה בשמירת סידור ההושבה. נסו שוב.');
    },
  });

  // Process guests data when loaded
  useEffect(() => {
    if (guestsData?.success && guestsData.guests) {
      const transformedGuests = guestService.transformApiGuestsToGuests(guestsData.guests);
      const confirmedCount = guestService.getConfirmedGuestsCount(transformedGuests);
      setConfirmedGuestsCount(confirmedCount);

      // If we have seating data, separate assigned/unassigned guests
      if (seatingData?.success && seatingData.data.tables?.length > 0) {
        const savedTables = seatingData.data.tables;
        setTables(savedTables);
        
        const assignedGuestIds = seatingService.getAssignedGuestIds(savedTables);
        const unassigned = transformedGuests.filter(guest => !assignedGuestIds.has(guest._id));
        setUnassignedGuests(unassigned);
        
        console.log(`[SEATING] Loaded ${savedTables.length} tables and ${unassigned.length} unassigned guests`);
      } else {
        // No saved arrangement, show all guests as unassigned
        setUnassignedGuests(transformedGuests);
        console.log(`[SEATING] Loaded ${transformedGuests.length} total guests, no saved seating arrangement`);
      }
    }
  }, [guestsData, seatingData]);

  // Show event setup modal logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tables.length === 0 && !hasShownEventSetup && unassignedGuests.length > 0) {
        setShowEventSetupModal(true);
        setHasShownEventSetup(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [tables.length, hasShownEventSetup, unassignedGuests.length]);

  // Business logic functions
  const assignGuestToTable = useCallback((guest: Guest, table: Table) => {
    const currentOccupiedSeats = table.guests.reduce((total, g) => total + (g.numberOfGuests || 1), 0);
    
    if (currentOccupiedSeats + (guest.numberOfGuests || 1) > table.capacity) {
      const availableSeats = table.capacity - currentOccupiedSeats;
      if (availableSeats <= 0) {
        alert('השולחן מלא! לא ניתן להוסיף עוד אורחים');
      } else {
        alert(`השולחן לא יכול להכיל את כל האורחים! נותרו ${availableSeats} מקומות פנויים, אך נדרשים ${(guest.numberOfGuests || 1)} מקומות עבור ${guest.name} ומלוויו.`);
      }
      return;
    }

    // Remove guest from current table (if assigned to another table)
    const updatedTables = tables.map(t => ({
      ...t,
      guests: t.guests.filter(g => g._id !== guest._id)
    }));

    // Add guest and companions to new table
    const targetTable = updatedTables.find(t => t.id === table.id);
    if (targetTable) {
      targetTable.guests.push({ ...guest, tableId: table.id });
      
      // Add companions (if any)
      const companions = [];
      for (let i = 1; i < (guest.numberOfGuests || 1); i++) {
        companions.push({
          ...guest,
          _id: `${guest._id}-companion-${i}`,
          name: `מלווה של ${guest.name}`,
          isConfirmed: guest.isConfirmed,
          tableId: table.id,
          isCompanion: true,
        });
      }
      targetTable.guests.push(...companions);
    }

    setTables(updatedTables);
    if (selectedTableForDetail && selectedTableForDetail.id === table.id) {
      setSelectedTableForDetail(targetTable || table);
    }
    setUnassignedGuests(prev => prev.filter(g => g._id !== guest._id));
  }, [tables, selectedTableForDetail]);

  const removeGuestFromTable = useCallback((guest: Guest) => {
    const updatedTables = tables.map(table => ({
      ...table,
      guests: table.guests.filter(g => g._id !== guest._id)
    }));
    setTables(updatedTables);
    
    if (selectedTableForDetail && selectedTableForDetail.guests.some(g => g._id === guest._id)) {
      const updatedSelectedTable = updatedTables.find(t => t.id === selectedTableForDetail.id);
      if (updatedSelectedTable) {
        setSelectedTableForDetail(updatedSelectedTable);
      }
    }
    
    setUnassignedGuests(prev => [...prev, { ...guest, tableId: undefined }]);
  }, [tables, selectedTableForDetail]);

  const addNewTable = useCallback((tableData: Partial<Table> = {}) => {
    const newTable = seatingService.createNewTable(tables, tableData);
    setTables(prev => [...prev, newTable]);
    setShowAddTableModal(false);
  }, [tables]);

  const clearAllTables = useCallback(() => {
    setTables([]);
    setShowClearConfirmModal(false);
    
    // Move all assigned guests back to unassigned
    const allGuests = [
      ...unassignedGuests,
      ...tables.flatMap(table => 
        table.guests
          .filter(guest => !guest.isCompanion)
          .map(guest => ({ ...guest, tableId: undefined }))
      )
    ];
    setUnassignedGuests(allGuests);
    setHasShownEventSetup(true);
  }, [tables, unassignedGuests]);

  const generateTableLayout = useCallback((eventData: EventSetupData) => {
    const result = seatingService.generateTableLayout(
      eventData.guestCount,
      eventData.tableType,
      eventData.customCapacity,
      eventData.knightTablesCount
    );
    
    setTables(result.tables);
    setBoardDimensions(result.dimensions);
    setShowEventSetupModal(false);
    
    return result.tables;
  }, []);

  const getGuestStatusInfo = useCallback((guest: Guest) => {
    return guestService.getGuestStatusInfo(guest);
  }, []);

  const getFilteredGuestsForSearch = useCallback(() => {
    return guestService.filterGuests(unassignedGuests, searchQuery, sideFilter, statusFilter);
  }, [unassignedGuests, searchQuery, sideFilter, statusFilter]);

  const smartAutoAssignGuests = useCallback(() => {
    const confirmedGuests = unassignedGuests.filter(guest => guest.isConfirmed);
    
    if (confirmedGuests.length === 0) {
      alert('אין אורחים מאושרים להושבה אוטומטית');
      return;
    }
    
    const sortedGuests = [...confirmedGuests].sort((a, b) => b.numberOfGuests - a.numberOfGuests);
    
    const getTableAvailableSpace = (table: Table) => {
      const occupied = table.guests.reduce((total, g) => total + g.numberOfGuests, 0);
      return table.capacity - occupied;
    };
    
    let assignedCount = 0;
    const failedAssignments = [];
    
    for (const guest of sortedGuests) {
      const suitableTables = tables
        .filter(table => getTableAvailableSpace(table) >= guest.numberOfGuests)
        .sort((a, b) => {
          const spaceA = getTableAvailableSpace(a);
          const spaceB = getTableAvailableSpace(b);
          const wasteA = spaceA - guest.numberOfGuests;
          const wasteB = spaceB - guest.numberOfGuests;
          return wasteA - wasteB;
        });
      
      if (suitableTables.length > 0) {
        assignGuestToTable(guest, suitableTables[0]);
        assignedCount++;
      } else {
        failedAssignments.push(guest);
      }
    }
    
    if (failedAssignments.length > 0) {
      const failedGuestsCount = failedAssignments.reduce((total, g) => total + g.numberOfGuests, 0);
      alert(`הושבה אוטומטית הושלמה!\n\n✅ הושבו בהצלחה: ${assignedCount} מוזמנים\n\n❌ לא ניתן להושיב: ${failedAssignments.length} מוזמנים (${failedGuestsCount} מקומות) - אין מספיק מקום רצוף בשולחנות הקיימים.`);
    } else {
      const totalSeated = confirmedGuests.reduce((total, g) => total + g.numberOfGuests, 0);
      alert(`🎉 הושבה אוטומטית הושלמה בהצלחה!\n\nכל ${confirmedGuests.length} המוזמנים המאושרים הושבו (${totalSeated} מקומות סה"כ).`);
    }
  }, [unassignedGuests, tables, assignGuestToTable]);

  // Save seating arrangement wrapper
  const saveSeatingArrangement = useCallback(async () => {
    const arrangementData = {
      name: 'סידור הושבה ראשי',
      description: 'סידור הושבה שנוצר על ידי המשתמש',
      eventSetup: {
        guestCount: unassignedGuests.length + tables.reduce((sum, table) => sum + table.guests.length, 0),
        tableType: 'custom' as const,
        customCapacity: 8
      },
      boardDimensions,
      isDefault: true
    };

    saveSeatingMutation.mutate({ arrangement: arrangementData, tables });
  }, [unassignedGuests.length, tables, boardDimensions, saveSeatingMutation]);

  const isLoading = isGuestsLoading || isSeatingLoading;

  const contextValue: SeatingContextType = {
    // State
    tables,
    unassignedGuests,
    selectedTable,
    selectedTableForDetail,
    isLoading,
    confirmedGuestsCount,
    hasShownEventSetup,
    
    // Map controls
    zoomLevel,
    mapPosition,
    boardDimensions,
    isDragging,
    isTableDragging,
    draggedTable,
    
    // Modal states
    showAddTableModal,
    showEventSetupModal,
    showClearConfirmModal,
    showTableDetailModal,
    
    // Search and filters
    searchQuery,
    sideFilter,
    statusFilter,
    
    // Setters
    setTables,
    setUnassignedGuests,
    setSelectedTable,
    setSelectedTableForDetail,
    setZoomLevel,
    setMapPosition,
    setBoardDimensions,
    setShowAddTableModal,
    setShowEventSetupModal,
    setShowClearConfirmModal,
    setShowTableDetailModal,
    setSearchQuery,
    setSideFilter,
    setStatusFilter,
    setIsDragging,
    setIsTableDragging,
    setDraggedTable,
    setHasShownEventSetup,
    
    // Business logic
    assignGuestToTable,
    removeGuestFromTable,
    addNewTable,
    clearAllTables,
    generateTableLayout,
    getGuestStatusInfo,
    getFilteredGuestsForSearch,
    smartAutoAssignGuests,
    saveSeatingArrangement,
  };

  return (
    <SeatingContext.Provider value={contextValue}>
      {children}
    </SeatingContext.Provider>
  );
}

export function useSeating() {
  const context = useContext(SeatingContext);
  if (!context) {
    throw new Error('useSeating must be used within a SeatingProvider');
  }
  return context;
}

export default SeatingContext; 