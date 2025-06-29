export interface Guest {
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
  isCompanion?: boolean;
}

export interface ApiGuest {
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

export interface Table {
  id: string;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular';
  x: number;
  y: number;
  guests: Guest[];
}

export interface EventSetupData {
  guestCount: number;
  tableType: 'regular' | 'knight' | 'mix' | 'custom';
  customCapacity?: number;
  knightTablesCount?: number;
}

export interface SeatingArrangement {
  name: string;
  description: string;
  eventSetup: EventSetupData;
  boardDimensions: { width: number; height: number };
  isDefault: boolean;
}

export interface MapPosition {
  x: number;
  y: number;
}

export interface BoardDimensions {
  width: number;
  height: number;
}

export interface GuestStatusInfo {
  text: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export type SideFilter = 'all' | 'חתן' | 'כלה' | 'משותף';
export type StatusFilter = 'all' | 'confirmed' | 'pending' | 'declined';

export interface SeatingContextType {
  // State
  tables: Table[];
  unassignedGuests: Guest[];
  selectedTable: Table | null;
  isLoading: boolean;
  confirmedGuestsCount: number;
  hasShownEventSetup: boolean;
  
  // Auto-save state
  isAutoSaving: boolean;
  lastSaved: Date | null;
  
  // Map controls
  zoomLevel: number;
  mapPosition: MapPosition;
  boardDimensions: BoardDimensions;
  isDragging: boolean;
  isTableDragging: boolean;
  draggedTable: Table | null;
  
  // Modal states
  showAddTableModal: boolean;
  showEventSetupModal: boolean;
  showClearConfirmModal: boolean;
  showTableDetailModal: boolean;
  
  // Search and filters
  searchQuery: string;
  sideFilter: SideFilter;
  statusFilter: StatusFilter;
  
  // Actions
  setTables: (tables: Table[]) => void;
  setUnassignedGuests: (guests: Guest[]) => void;
  setSelectedTable: (table: Table | null) => void;
  setZoomLevel: (zoom: number) => void;
  setMapPosition: (position: MapPosition) => void;
  setBoardDimensions: (dimensions: BoardDimensions) => void;
  setShowAddTableModal: (show: boolean) => void;
  setShowEventSetupModal: (show: boolean) => void;
  setShowClearConfirmModal: (show: boolean) => void;
  setShowTableDetailModal: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSideFilter: (filter: SideFilter) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setIsDragging: (dragging: boolean) => void;
  setIsTableDragging: (dragging: boolean) => void;
  setDraggedTable: (table: Table | null) => void;
  setHasShownEventSetup: (shown: boolean) => void;
  
  // Business logic
  assignGuestToTable: (guest: Guest, table: Table) => void;
  removeGuestFromTable: (guest: Guest) => void;
  addNewTable: (tableData: Partial<Table>) => void;
  clearAllTables: () => void;
  generateTableLayout: (eventData: EventSetupData) => Table[];
  getGuestStatusInfo: (guest: Guest) => GuestStatusInfo;
  getFilteredGuestsForSearch: () => Guest[];
  smartAutoAssignGuests: () => void;
} 