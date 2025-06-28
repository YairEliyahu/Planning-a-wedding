import { Table, SeatingArrangement, BoardDimensions } from '../types';

export interface SeatingResponse {
  success: boolean;
  data: {
    tables: Table[];
    message?: string;
  };
  error?: string;
}

export interface SaveSeatingRequest {
  userId: string;
  arrangement: SeatingArrangement;
  tables: Table[];
}

export const seatingService = {
  /**
   * Fetch seating arrangement for a specific user
   */
  fetchSeatingArrangement: async (userId: string): Promise<SeatingResponse> => {
    const headers = {
      'Accept': 'application/json',
      'Cache-Control': 'max-age=120', // 2 minutes cache
    };

    const response = await fetch(`/api/seating?userId=${userId}`, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch seating arrangement`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch seating arrangement');
    }
    
    return data;
  },

  /**
   * Save seating arrangement to database
   */
  saveSeatingArrangement: async (request: SaveSeatingRequest): Promise<SeatingResponse> => {
    const response = await fetch('/api/seating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Failed to save seating arrangement');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save seating arrangement');
    }

    return result;
  },

  /**
   * Generate automatic table layout based on event details
   */
  generateTableLayout: (
    guestCount: number, 
    tableType: string, 
    customCapacity?: number, 
    knightTablesCount?: number
  ): { tables: Table[]; dimensions: BoardDimensions } => {
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
    
    // Adjust board dimensions with padding
    const mapPadding = 60;
    const minMapWidth = 1800;
    const minMapHeight = 1200;
    
    const newWidth = Math.max(minMapWidth, totalWidth + (mapPadding * 2));
    const newHeight = Math.max(minMapHeight, totalHeight + (mapPadding * 2));
    
    const newDimensions = { width: newWidth, height: newHeight };
    
    // Center the grid within the map area
    const startX = (newWidth - totalWidth) / 2;
    const startY = (newHeight - totalHeight) / 2;
    
    // Position tables in centered grid
    for (let i = 0; i < newTables.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      newTables[i].x = startX + (col * (tableSize + spacing));
      newTables[i].y = startY + (row * (tableSize + spacing));
    }
    
    return {
      tables: newTables,
      dimensions: newDimensions
    };
  },

  /**
   * Create a new table with default positioning
   */
  createNewTable: (
    existingTables: Table[], 
    tableData: Partial<Table> = {}
  ): Table => {
    const tableNumber = existingTables.length + 1;
    
    return {
      id: `table${tableNumber}`,
      name: `שולחן ${tableNumber}`,
      capacity: 8,
      shape: 'round',
      x: 200 + (existingTables.length * 50),
      y: 200 + (existingTables.length * 50),
      guests: [],
      ...tableData
    };
  },

  /**
   * Get assigned guest IDs from tables
   */
  getAssignedGuestIds: (tables: Table[]): Set<string> => {
    const assignedGuestIds = new Set<string>();
    tables.forEach((table) => {
      table.guests.forEach((guest) => {
        assignedGuestIds.add(guest._id);
      });
    });
    return assignedGuestIds;
  },

  /**
   * Calculate table statistics
   */
  getTableStatistics: (tables: Table[]) => {
    const totalTables = tables.length;
    const totalSeatedGuests = tables.reduce((sum, table) => 
      sum + table.guests.reduce((guestSum, guest) => guestSum + guest.numberOfGuests, 0), 0
    );
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
    const knightTables = tables.filter(t => t.capacity > 16).length;
    
    return {
      totalTables,
      totalSeatedGuests,
      totalCapacity,
      knightTables,
      occupancyRate: totalCapacity > 0 ? (totalSeatedGuests / totalCapacity) * 100 : 0
    };
  },

  /**
   * Save map view state to localStorage
   */
  saveMapViewState: (zoom: number, position: { x: number; y: number }): void => {
    try {
      localStorage.setItem('seating-map-view', JSON.stringify({
        zoom,
        position
      }));
    } catch (error) {
      console.warn('Failed to save map view state:', error);
    }
  },

  /**
   * Load map view state from localStorage
   */
  loadMapViewState: (): { zoom: number; position: { x: number; y: number } } | null => {
    try {
      const savedView = localStorage.getItem('seating-map-view');
      if (savedView) {
        return JSON.parse(savedView);
      }
    } catch (error) {
      console.warn('Failed to load map view state:', error);
    }
    return null;
  }
};

// React Query keys for seating-related queries
export const seatingKeys = {
  all: ['seating'] as const,
  byUser: (userId: string) => ['seating', userId] as const,
  arrangement: (userId: string) => ['seating', userId, 'arrangement'] as const,
}; 