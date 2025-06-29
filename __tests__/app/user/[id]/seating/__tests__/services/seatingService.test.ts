import { seatingService } from '../../services/seatingService';
import { createMockTable, createMockGuest } from '../setup/testUtils';

describe('SeatingService', () => {
  describe('generateTableLayout', () => {
    it('should generate regular table layout correctly', () => {
      const result = seatingService.generateTableLayout(120, 'regular');
      
      if (result.tables.length !== 10) {
        throw new Error(`Expected 10 tables, got ${result.tables.length}`);
      }
      
      if (result.tables[0].capacity !== 12) {
        throw new Error(`Expected capacity 12, got ${result.tables[0].capacity}`);
      }
      
      if (result.tables[0].shape !== 'round') {
        throw new Error(`Expected round shape, got ${result.tables[0].shape}`);
      }
      
      if (result.dimensions.width <= 0) {
        throw new Error('Width should be greater than 0');
      }
      
      if (result.dimensions.height <= 0) {
        throw new Error('Height should be greater than 0');
      }
    });

    it('should generate knight table layout correctly', () => {
      const result = seatingService.generateTableLayout(96, 'knight');
      
      if (result.tables.length !== 4) {
        throw new Error(`Expected 4 tables, got ${result.tables.length}`);
      }
      
      if (result.tables[0].capacity !== 24) {
        throw new Error(`Expected capacity 24, got ${result.tables[0].capacity}`);
      }
      
      if (result.tables[0].shape !== 'rectangular') {
        throw new Error(`Expected rectangular shape, got ${result.tables[0].shape}`);
      }
      
      if (!result.tables[0].name.includes('אביר')) {
        throw new Error('Table name should contain אביר');
      }
    });

    it('should generate custom table layout correctly', () => {
      const result = seatingService.generateTableLayout(80, 'custom', 16);
      
      if (result.tables.length !== 5) {
        throw new Error(`Expected 5 tables, got ${result.tables.length}`);
      }
      
      if (result.tables[0].capacity !== 16) {
        throw new Error(`Expected capacity 16, got ${result.tables[0].capacity}`);
      }
    });
  });

  describe('createNewTable', () => {
    it('should create new table with unique ID', () => {
      const existingTables = [
        createMockTable({ id: 'table1', name: 'Table 1' }),
        createMockTable({ id: 'table2', name: 'Table 2' }),
      ];
      
      const newTable = seatingService.createNewTable(existingTables);
      
      if (newTable.id !== 'table3') {
        throw new Error(`Expected table3, got ${newTable.id}`);
      }
      
      if (newTable.capacity !== 8) {
        throw new Error(`Expected capacity 8, got ${newTable.capacity}`);
      }
      
      if (newTable.guests.length !== 0) {
        throw new Error('New table should have no guests');
      }
    });
  });

  describe('getAssignedGuestIds', () => {
    it('should return set of assigned guest IDs', () => {
      const tables = [
        createMockTable({
          id: 'table1',
          name: 'Table 1',
          guests: [
            createMockGuest({ _id: 'guest1', name: 'Guest 1' }),
            createMockGuest({ _id: 'guest2', name: 'Guest 2' }),
          ]
        }),
        createMockTable({
          id: 'table2',
          name: 'Table 2',
          guests: [
            createMockGuest({ _id: 'guest3', name: 'Guest 3' }),
          ]
        }),
      ];
      
      const assignedIds = seatingService.getAssignedGuestIds(tables);
      
      if (!assignedIds.has('guest1')) {
        throw new Error('Should include guest1');
      }
      
      if (!assignedIds.has('guest2')) {
        throw new Error('Should include guest2');
      }
      
      if (!assignedIds.has('guest3')) {
        throw new Error('Should include guest3');
      }
      
      if (assignedIds.has('guest4')) {
        throw new Error('Should not include guest4');
      }
    });
  });

  describe('localStorage operations', () => {
    beforeEach(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    });

    it('should save and load map view state', () => {
      const viewState = { zoom: 1.5, position: { x: 100, y: 200 } };
      
      seatingService.saveMapViewState(viewState.zoom, viewState.position);
      const loaded = seatingService.loadMapViewState();
      
      if (!loaded || loaded.zoom !== viewState.zoom) {
        throw new Error('Failed to save/load zoom level');
      }
      
      if (loaded.position.x !== viewState.position.x || loaded.position.y !== viewState.position.y) {
        throw new Error('Failed to save/load position');
      }
    });
  });
}); 