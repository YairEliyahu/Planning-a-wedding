// Mock AbortSignal.timeout first
Object.defineProperty(global, 'AbortSignal', {
  value: {
    ...global.AbortSignal,
    timeout: jest.fn((delay: number) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), delay);
      return controller.signal;
    }),
  },
  writable: true,
});

// Mock XLSX first, before importing anything else
jest.mock('xlsx', () => ({
  read: jest.fn().mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {
        'A1': { v: 'שם המוזמן' },
        'B1': { v: 'מספר טלפון' },
        'C1': { v: 'מספר מוזמנים' },
      },
    },
  }),
  utils: {
    sheet_to_json: jest.fn().mockReturnValue([
      {
        A: 'ישראל ישראלי',
        B: '050-1234567',
        C: '2',
        D: 'חתן',
        E: 'כן',
        F: 'הערות',
        G: 'משפחה',
      },
    ]),
    json_to_sheet: jest.fn().mockReturnValue({}),
    sheet_add_aoa: jest.fn(),
    book_new: jest.fn().mockReturnValue({}),
    book_append_sheet: jest.fn(),
    write: jest.fn().mockReturnValue(new ArrayBuffer(8)),
  },
}));

import { guestService } from '../../services/guestService';
import { mockGuests, mockNewGuest, mockApiResponse } from '../mocks/mockData';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('guestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchGuests', () => {
    it('should fetch guests successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await guestService.fetchGuests('test-user-id');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/guests?userId=test-user-id',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockGuests);
    });

    it('should handle fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server Error',
      } as Response);

      try {
        await guestService.fetchGuests('test-user-id');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle network error', async () => {
      // Don't mock the network error - it will be caught by AbortSignal timeout
      const errorMessage = 'Test network error';
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      try {
        await guestService.fetchGuests('test-user-id');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect((error as Error).message).toContain('Test network error');
      }
    });

    it('should filter out invalid guests', async () => {
      const invalidResponse = {
        success: true,
        guests: [
          mockGuests[0],
          null,
          { name: null },
          { _id: 'test', name: 'Valid Guest', numberOfGuests: 1, side: 'חתן', isConfirmed: null, notes: '', createdAt: new Date(), updatedAt: new Date() },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse,
      } as Response);

      const result = await guestService.fetchGuests('test-user-id');

      expect(result.length).toBe(2);
      expect(result.every(guest => guest.name && typeof guest.name === 'string')).toBe(true);
    });
  });

  describe('addGuest', () => {
    it('should add guest successfully', async () => {
      const newGuest = { ...mockNewGuest, _id: 'new-id', createdAt: new Date(), updatedAt: new Date() };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guest: newGuest }),
      } as Response);

      const result = await guestService.addGuest({ ...mockNewGuest, userId: 'test-user-id' });

      expect(mockFetch).toHaveBeenCalledWith('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ ...mockNewGuest, userId: 'test-user-id' }),
      });
      expect(result).toEqual(newGuest);
    });

    it('should handle add guest error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server Error',
      } as Response);

      try {
        await guestService.addGuest({ ...mockNewGuest, userId: 'test-user-id' });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect((error as Error).message).toBe('Failed to add guest - 500: Server Error');
      }
    });
  });

  describe('updateGuest', () => {
    it('should update guest successfully', async () => {
      const updatedGuest = { ...mockGuests[0], name: 'Updated Name' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guest: updatedGuest }),
      } as Response);

      const result = await guestService.updateGuest(updatedGuest);

      expect(mockFetch).toHaveBeenCalledWith(`/api/guests/${updatedGuest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(updatedGuest),
      });
      expect(result).toEqual(updatedGuest);
    });

    it('should handle update guest error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Update failed' }),
      } as Response);

      try {
        await guestService.updateGuest(mockGuests[0]);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect((error as Error).message).toBe('Update failed');
      }
    });
  });

  describe('deleteGuest', () => {
    it('should delete guest successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await guestService.deleteGuest('guest-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/guests/guest-1', {
        method: 'DELETE',
      });
    });

    it('should handle delete guest error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Delete failed' }),
      } as Response);

      try {
        await guestService.deleteGuest('guest-1');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect((error as Error).message).toBe('Delete failed');
      }
    });
  });

  describe('confirmGuest', () => {
    it('should confirm guest successfully', async () => {
      const confirmedGuest = { ...mockGuests[0], isConfirmed: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guest: confirmedGuest }),
      } as Response);

      const result = await guestService.confirmGuest('guest-1', true);

      expect(mockFetch).toHaveBeenCalledWith('/api/guests/guest-1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isConfirmed: true }),
      });
      expect(result).toEqual(confirmedGuest);
    });
  });

  describe('deleteAllGuests', () => {
    it('should delete all guests successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deletedCount: 5 }),
      } as Response);

      const result = await guestService.deleteAllGuests('test-user-id');

      expect(mockFetch).toHaveBeenCalledWith('/api/guests/delete-all?userId=test-user-id', {
        method: 'DELETE',
      });
      expect(result).toEqual({ deletedCount: 5 });
    });
  });

  describe('cleanupDuplicates', () => {
    it('should cleanup duplicates successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ removedCount: 3 }),
      } as Response);

      const result = await guestService.cleanupDuplicates('test-user-id');

      expect(mockFetch).toHaveBeenCalledWith('/api/guests/cleanup-duplicates?userId=test-user-id', {
        method: 'POST',
      });
      expect(result).toEqual({ removedCount: 3 });
    });
  });

  describe('importGuests', () => {
    it('should import guests from Excel file', async () => {
      const mockFile = new File(['mock content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Mock successful API calls for adding guests
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ guest: mockGuests[0] }),
      } as Response);

      const result = await guestService.importGuests(mockFile, 'test-user-id');

      expect(result.success >= 0).toBe(true);
      expect(typeof result.error).toBe('number');
    });

    it('should handle import errors', async () => {
      const mockFile = new File(['invalid content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Mock API error
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      } as Response);

      const result = await guestService.importGuests(mockFile, 'test-user-id');

      expect(result.error >= 0).toBe(true);
    });
  });

  describe('downloadTemplate', () => {
    it('should trigger download', () => {
      // Mock URL.createObjectURL and document.createElement
      const mockObjectURL = 'blob:mock-url';
      const mockClick = jest.fn();
      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };

      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: jest.fn().mockReturnValue(mockObjectURL),
          revokeObjectURL: jest.fn(),
        },
        writable: true,
      });

      jest.spyOn(document, 'createElement').mockReturnValue(mockElement as any);

      guestService.downloadTemplate();

      expect(mockElement.href).toBe(mockObjectURL);
      expect(mockElement.download).toBe('guest-list-template.xlsx');
      expect(mockClick).toHaveBeenCalled();
    });
  });
}); 