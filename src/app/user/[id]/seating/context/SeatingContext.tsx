'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
import { guestService } from '../services/guestService';
import { seatingService } from '../services/seatingService';

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

  // Fetch guests query - using consistent query key with guestlist
  const { 
    data: guestsData, 
    isLoading: isGuestsLoading,
  } = useQuery({
    queryKey: ['guests', userId],
    queryFn: () => guestService.fetchGuests(userId),
    enabled: !!userId,
    staleTime: 30000,
    refetchInterval: false,
  });

  // Fetch seating arrangement query
  const { 
    data: seatingData, 
    isLoading: isSeatingLoading,
  } = useQuery({
    queryKey: ['seating', userId],
    queryFn: () => seatingService.fetchSeatingArrangement(userId),
    enabled: !!userId,
  });

  // Save seating arrangement mutation
  const saveSeatingMutation = useMutation({
    mutationFn: (data: { arrangement: SeatingArrangement; tables: Table[] }) => {
      // Clean companion IDs before sending to API to prevent 500 errors
      const cleanedTables = data.tables.map(table => ({
        ...table,
        guests: table.guests.filter(guest => !guest.isCompanion).map(guest => ({
          ...guest,
          // Ensure valid _id format for database
          _id: guest._id.includes('-companion-') ? guest._id.split('-companion-')[0] : guest._id
        }))
      }));
      
      return seatingService.saveSeatingArrangement({
        userId,
        arrangement: data.arrangement,
        tables: cleanedTables
      });
    },
    onSuccess: (result) => {
      toast.success(result.data?.message || 'סידור ההושבה נשמר בהצלחה!');
      // Invalidate related queries - both guest and seating
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
      queryClient.invalidateQueries({ queryKey: ['seating', userId] });
    },
    onError: (error) => {
      console.error('Error saving seating arrangement:', error);
      toast.error('שגיאה בשמירת סידור ההושבה. נסו שוב.');
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
      } else {
        // No saved arrangement, show all guests as unassigned
        setUnassignedGuests(transformedGuests);
      }
    }
  }, [guestsData, seatingData]);

  // Business logic functions
  const assignGuestToTable = useCallback((guest: Guest, table: Table) => {
    const currentOccupiedSeats = table.guests.reduce((total, g) => total + (g.numberOfGuests || 1), 0);
    
    if (currentOccupiedSeats + (guest.numberOfGuests || 1) > table.capacity) {
      const availableSeats = table.capacity - currentOccupiedSeats;
      if (availableSeats <= 0) {
        toast.error('השולחן מלא! לא ניתן להוסיף עוד אורחים');
      } else {
        toast.error(`השולחן לא יכול להכיל את כל האורחים! נותרו ${availableSeats} מקומות פנויים, אך נדרשים ${(guest.numberOfGuests || 1)} מקומות עבור ${guest.name} ומלוויו.`);
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
    setUnassignedGuests(prev => prev.filter(g => g._id !== guest._id));
    
    // Success message
    toast.success(`${guest.name} הוסף לשולחן ${table.name}`);
  }, [tables]);

  const removeGuestFromTable = useCallback((guest: Guest) => {
    const updatedTables = tables.map(table => ({
      ...table,
      guests: table.guests.filter(g => {
        // Remove main guest and all their companions
        if (g._id === guest._id) return false;
        if (g._id.startsWith(`${guest._id}-companion-`)) return false;
        return true;
      })
    }));
    
    setTables(updatedTables);
    
    // Only add back main guest (not companions) to unassigned
    if (!guest.isCompanion) {
    setUnassignedGuests(prev => [...prev, { ...guest, tableId: undefined }]);
      toast.success(`${guest.name} הוסר מהשולחן${guest.numberOfGuests > 1 ? ` (כולל ${guest.numberOfGuests - 1} מלווים)` : ''}`);
    }
  }, [tables]);

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
      toast('אין אורחים מאושרים להושבה אוטומטית', { icon: 'ℹ️' });
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
      toast(`הושבה אוטומטית הושלמה! הושבו ${assignedCount} מוזמנים, ${failedAssignments.length} לא ניתן להושיב (אין מקום)`, { 
        icon: '⚠️', 
        duration: 6000 
      });
    } else {
      const totalSeated = confirmedGuests.reduce((total, g) => total + g.numberOfGuests, 0);
      toast.success(`🎉 הושבה אוטומטית הושלמה! כל ${confirmedGuests.length} המוזמנים הושבו (${totalSeated} מקומות)`, {
        duration: 5000
      });
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