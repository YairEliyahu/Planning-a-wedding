'use client';

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GuestProvider, useGuests } from '@/app/user/[id]/guestlist/context/GuestContext';
import { mockGuests, mockNewGuest } from '../mocks/mockData';

// Mock the service
jest.mock('@/app/user/[id]/guestlist/services/guestService', () => ({
  guestService: {
    fetchGuests: jest.fn(),
    addGuest: jest.fn(),
    updateGuest: jest.fn(),
    deleteGuest: jest.fn(),
    confirmGuest: jest.fn(),
    deleteAllGuests: jest.fn(),
    importGuests: jest.fn(),
  },
}));

// Mock Auth Context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: 'test-user-id',
      email: 'test@example.com',
      connectedUserId: null,
      sharedEventId: null,
    },
  }),
}));

// Mock Sync Context
jest.mock('@/contexts/SyncContext', () => ({
  useSync: () => ({
    emitUpdate: jest.fn(),
    isConnected: true,
    lastSync: null,
  }),
  SyncProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Import the mocked service
import { guestService } from '@/app/user/[id]/guestlist/services/guestService';
const mockGuestService = guestService as jest.Mocked<typeof guestService>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <GuestProvider userId="test-user-id">
        {children}
      </GuestProvider>
    </QueryClientProvider>
  );
};

const createWrapper = (_queryClient: QueryClient) => {  
  return TestWrapper;
};

describe('GuestContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
    mockGuestService.fetchGuests.mockResolvedValue(mockGuests);
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useGuests hook', () => {
    it('should provide initial state', async () => {
      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      if (result.current.isLoading !== true) {
        throw new Error('Expected isLoading to be true');
      }
      if (result.current.guests.length !== 0) {
        throw new Error('Expected guests to be empty array');
      }
      if (result.current.error !== null) {
        throw new Error('Expected error to be null');
      }
      if (result.current.filters.filter !== 'all') {
        throw new Error('Expected filter to be all');
      }
    });

    it('should fetch and provide guests', async () => {
      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        if (result.current.isLoading !== false) {
          throw new Error('Expected isLoading to be false');
        }
      });

      const calls = (mockGuestService.fetchGuests as jest.Mock).mock.calls;
      if (calls.length === 0 || calls[0][0] !== 'test-user-id') {
        throw new Error('Expected fetchGuests to be called with test-user-id');
      }
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch';
      // Mock the error multiple times because React Query retries 3 times
      mockGuestService.fetchGuests.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 10000 });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      }, { timeout: 5000 });
    });
  });

  describe('Guest mutations', () => {
    it('should add a guest', async () => {
      const newGuest = { ...mockNewGuest, _id: 'new-guest-id', createdAt: new Date(), updatedAt: new Date() };
      mockGuestService.addGuest.mockResolvedValueOnce(newGuest);

      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.addGuest(mockNewGuest);
      });

      const calls = (mockGuestService.addGuest as jest.Mock).mock.calls;
      if (calls.length === 0) {
        throw new Error('Expected addGuest to be called');
      }
      const calledWith = calls[0][0];
      if (calledWith.userId !== 'test-user-id') {
        throw new Error('Expected addGuest to be called with correct userId');
      }
    });

    it('should update a guest', async () => {
      const updatedGuest = { ...mockGuests[0], name: 'Updated Name' };
      mockGuestService.updateGuest.mockResolvedValueOnce(updatedGuest);

      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.updateGuest(updatedGuest);
      });

      const calls = (mockGuestService.updateGuest as jest.Mock).mock.calls;
      if (calls.length === 0 || calls[0][0] !== updatedGuest) {
        throw new Error('Expected updateGuest to be called with updatedGuest');
      }
    });

    it('should delete a guest', async () => {
      mockGuestService.deleteGuest.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.deleteGuest('guest-1');
      });

      const calls = (mockGuestService.deleteGuest as jest.Mock).mock.calls;
      if (calls.length === 0 || calls[0][0] !== 'guest-1') {
        throw new Error('Expected deleteGuest to be called with guest-1');
      }
    });

    it('should confirm a guest', async () => {
      const confirmedGuest = { ...mockGuests[0], isConfirmed: true };
      mockGuestService.confirmGuest.mockResolvedValueOnce(confirmedGuest);

      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.confirmGuest('guest-1', true);
      });

      const calls = (mockGuestService.confirmGuest as jest.Mock).mock.calls;
      if (calls.length === 0 || calls[0][0] !== 'guest-1' || calls[0][1] !== true) {
        throw new Error('Expected confirmGuest to be called with guest-1 and true');
      }
    });

    it('should delete all guests', async () => {
      mockGuestService.deleteAllGuests.mockResolvedValueOnce({ deletedCount: 5 });

      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        const resultValue = await result.current.deleteAllGuests();
        if (resultValue.deletedCount !== 5) {
          throw new Error('Expected deletedCount to be 5');
        }
      });

      const calls = (mockGuestService.deleteAllGuests as jest.Mock).mock.calls;
      if (calls.length === 0 || calls[0][0] !== 'test-user-id') {
        throw new Error('Expected deleteAllGuests to be called with test-user-id');
      }
    });
  });

  describe('Filters', () => {
    it('should filter guests by confirmation status', async () => {
      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        if (result.current.isLoading !== false) {
          throw new Error('Expected isLoading to be false');
        }
      });

      act(() => {
        result.current.setFilters({ filter: 'confirmed' });
      });

      const confirmedGuests = result.current.filteredGuests;
      if (confirmedGuests.length !== 1) {
        throw new Error('Expected 1 confirmed guest');
      }
      if (confirmedGuests[0].isConfirmed !== true) {
        throw new Error('Expected confirmed guest to have isConfirmed true');
      }

      act(() => {
        result.current.setFilters({ filter: 'declined' });
      });

      const declinedGuests = result.current.filteredGuests;
      if (declinedGuests.length !== 1) {
        throw new Error('Expected 1 declined guest');
      }
      if (declinedGuests[0].isConfirmed !== false) {
        throw new Error('Expected declined guest to have isConfirmed false');
      }

      act(() => {
        result.current.setFilters({ filter: 'pending' });
      });

      const pendingGuests = result.current.filteredGuests;
      if (pendingGuests.length !== 1) {
        throw new Error('Expected 1 pending guest');
      }
      if (pendingGuests[0].isConfirmed !== null) {
        throw new Error('Expected pending guest to have isConfirmed null');
      }
    });

    it('should filter guests by side', async () => {
      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        if (result.current.isLoading !== false) {
          throw new Error('Expected isLoading to be false');
        }
      });

      act(() => {
        result.current.setFilters({ sideFilter: 'חתן' });
      });

      const groomGuests = result.current.filteredGuests;
      if (groomGuests.length !== 1) {
        throw new Error('Expected 1 groom guest');
      }
      if (groomGuests[0].side !== 'חתן') {
        throw new Error('Expected groom guest to have side חתן');
      }
    });

    it('should filter guests by search query', async () => {
      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        if (result.current.isLoading !== false) {
          throw new Error('Expected isLoading to be false');
        }
      });

      act(() => {
        result.current.setFilters({ searchQuery: 'ישראל' });
      });

      const searchResults = result.current.filteredGuests;
      if (searchResults.length !== 1) {
        throw new Error('Expected 1 search result');
      }
      if (!searchResults[0].name.includes('ישראל')) {
        throw new Error('Expected search result to contain ישראל');
      }
    });
  });

  describe('Statistics', () => {
    it('should calculate correct statistics', async () => {
      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        if (result.current.isLoading !== false) {
          throw new Error('Expected isLoading to be false');
        }
      });

      const stats = result.current.stats;
      if (stats.totalCount !== 3) {
        throw new Error('Expected totalCount to be 3');
      }
      if (stats.confirmedCount !== 1) {
        throw new Error('Expected confirmedCount to be 1');
      }
      if (stats.declinedCount !== 1) {
        throw new Error('Expected declinedCount to be 1');
      }
      if (stats.pendingCount !== 1) {
        throw new Error('Expected pendingCount to be 1');
      }
      if (stats.totalGuests !== 6) {
        throw new Error('Expected totalGuests to be 6');
      }
      if (stats.confirmedGuests !== 2) {
        throw new Error('Expected confirmedGuests to be 2');
      }
    });
  });

  describe('Import functionality', () => {
    it('should import guests from file', async () => {
      const mockFile = new File(['mock content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      mockGuestService.importGuests.mockResolvedValueOnce({
        success: 5,
        error: 0,
      });

      const { result } = renderHook(() => useGuests(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.importGuests(mockFile);
      });

      const calls = (mockGuestService.importGuests as jest.Mock).mock.calls;
      if (calls.length === 0) {
        throw new Error('Expected importGuests to be called');
      }
      if (calls[0][0] !== mockFile || calls[0][1] !== 'test-user-id' || calls[0][2] !== null) {
        throw new Error('Expected importGuests to be called with correct arguments');
      }
    });
  });

  it('should have required functions', () => {
    const { result } = renderHook(() => useGuests(), {
      wrapper: createWrapper(queryClient),
    });

    if (typeof result.current.addGuest !== 'function') {
      throw new Error('Expected addGuest to be a function');
    }
    if (typeof result.current.updateGuest !== 'function') {
      throw new Error('Expected updateGuest to be a function');
    }
    if (typeof result.current.deleteGuest !== 'function') {
      throw new Error('Expected deleteGuest to be a function');
    }
  });
}); 