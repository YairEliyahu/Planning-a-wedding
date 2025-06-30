'use client';

import { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSync } from '@/contexts/SyncContext';
import { guestService } from '../services/guestService';

export interface Guest {
  _id: string;
  name: string;
  phoneNumber?: string;
  numberOfGuests: number;
  side: 'חתן' | 'כלה' | 'משותף';
  isConfirmed: boolean | null;
  notes: string;
  group?: string;
  createdAt: Date;
  updatedAt: Date;
  sharedEventId?: string;
}

export type NewGuest = Omit<Guest, '_id' | 'createdAt' | 'updatedAt'>;

interface GuestFilters {
  filter: 'all' | 'confirmed' | 'declined' | 'pending';
  sideFilter: 'all' | 'חתן' | 'כלה' | 'משותף';
  searchQuery: string;
}

interface GuestContextType {
  guests: Guest[];
  isLoading: boolean;
  error: string | null;
  filters: GuestFilters;
  setFilters: (filters: Partial<GuestFilters>) => void;
  addGuest: (guest: NewGuest) => Promise<Guest>;
  updateGuest: (guest: Guest) => Promise<Guest>;
  deleteGuest: (guestId: string) => Promise<void>;
  confirmGuest: (guestId: string, status: boolean | null) => Promise<Guest>;
  deleteAllGuests: () => Promise<{ deletedCount: number }>;
  forceRefresh: () => Promise<void>;
  cleanupDuplicates: () => Promise<{ removedCount: number }>;
  importGuests: (file: File, onProgress?: (current: number, total: number, currentName: string) => void) => Promise<{ success: number; error: number; errorDetails?: any }>;
  filteredGuests: Guest[];
  stats: {
    totalCount: number;
    confirmedCount: number;
    declinedCount: number;
    pendingCount: number;
    totalGuests: number;
    confirmedGuests: number;
  };
  isAddingGuest: boolean;
  isUpdatingGuest: boolean;
  isDeletingGuest: boolean;
  isImportingGuests: boolean;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

interface GuestProviderProps {
  children: ReactNode;
  userId: string;
}

export function GuestProvider({ children, userId }: GuestProviderProps) {
  const { user } = useAuth();
  const { emitUpdate } = useSync();
  const queryClient = useQueryClient();

  // Use sharedEventId if exists, otherwise fallback to userId
  const effectiveId = user?.sharedEventId || userId;

  // State for filters
  const [filters, setFiltersState] = useState<GuestFilters>({
    filter: 'all',
    sideFilter: 'all',
    searchQuery: ''
  });

  const setFilters = (newFilters: Partial<GuestFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // Query for guests
  const {
    data: guests = [],
    isLoading,
    error: queryError
  } = useQuery<Guest[], Error>({
    queryKey: ['guests', effectiveId],
    queryFn: () => guestService.fetchGuests(effectiveId),
    staleTime: 0, // Always consider data stale for immediate updates
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes (renamed from cacheTime in v5)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: false,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Debug: Log when guests data changes
  useEffect(() => {
    console.log('📊 GuestContext: Guests data updated:', {
      count: guests.length,
      guests: guests.map(g => ({ id: g._id, name: g.name }))
    });
  }, [guests]);

  // Helper function to invalidate all guest-related queries
  const invalidateGuestQueries = async () => {
    // Force refetch guest list queries immediately
    await queryClient.refetchQueries({ queryKey: ['guests', effectiveId] });
    // Invalidate seating queries (which also depend on guest data)
    queryClient.invalidateQueries({ queryKey: ['seating', effectiveId] });
  };

  // Simple refresh function for immediate updates
  const simpleRefresh = async () => {
    try {
      await queryClient.refetchQueries({ queryKey: ['guests', effectiveId] });
    } catch (error) {
      console.error('❌ Simple refresh failed:', error);
    }
  };

  // Mutations
  const addGuestMutation = useMutation({
    mutationFn: (guest: NewGuest) => guestService.addGuest({ ...guest, userId: effectiveId }),
    onSuccess: async (newGuest) => {
      // Update the cache with the new guest from server
      queryClient.setQueryData(['guests', effectiveId], (old: Guest[] = []) => {
        return [...old, newGuest];
      });
      
      // Send update to partner
      emitUpdate('guests', 'add', { guest: newGuest });
    },
    onError: (err, _newGuest) => {
      console.error('❌ Failed to add guest:', err);
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: (guest: Guest) => guestService.updateGuest({ ...guest, userId: effectiveId }),
    onMutate: async (updatedGuest) => {
      await queryClient.cancelQueries({ queryKey: ['guests', effectiveId] });
      const previousGuests = queryClient.getQueryData(['guests', effectiveId]);

      queryClient.setQueryData(['guests', effectiveId], (old: Guest[] = []) => {
        return old.map(guest => 
          guest._id === updatedGuest._id ? { ...updatedGuest, updatedAt: new Date() } : guest
        );
      });

      return { previousGuests };
    },
    onError: (err, updatedGuest, context) => {
      if (context?.previousGuests) {
        queryClient.setQueryData(['guests', effectiveId], context.previousGuests);
      }
    },
    onSuccess: async (updatedGuest) => {
      await invalidateGuestQueries();
      
      // Send update to partner
      emitUpdate('guests', 'update', { guest: updatedGuest });
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: (guestId: string) => guestService.deleteGuest(guestId),
    onMutate: async (guestId) => {
      await queryClient.cancelQueries({ queryKey: ['guests', effectiveId] });
      const previousGuests = queryClient.getQueryData(['guests', effectiveId]);

      queryClient.setQueryData(['guests', effectiveId], (old: Guest[] = []) => {
        return old.filter(guest => guest._id !== guestId);
      });

      return { previousGuests };
    },
    onError: (err, guestId, context) => {
      if (context?.previousGuests) {
        queryClient.setQueryData(['guests', effectiveId], context.previousGuests);
      }
    },
    onSuccess: async (_, guestId) => {
      await invalidateGuestQueries();
      
      // Send update to partner
      emitUpdate('guests', 'delete', { guestId });
    },
  });

  const confirmGuestMutation = useMutation({
    mutationFn: ({ guestId, status }: { guestId: string; status: boolean | null }) =>
      guestService.confirmGuest(guestId, status),
    onMutate: async ({ guestId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['guests', effectiveId] });
      const previousGuests = queryClient.getQueryData(['guests', effectiveId]);

      queryClient.setQueryData(['guests', effectiveId], (old: Guest[] = []) => {
        return old.map(guest => 
          guest._id === guestId 
            ? { ...guest, isConfirmed: status, updatedAt: new Date() } 
            : guest
        );
      });

      return { previousGuests };
    },
    onError: (err, _variables, context) => {
      if (context?.previousGuests) {
        queryClient.setQueryData(['guests', effectiveId], context.previousGuests);
      }
    },
    onSuccess: async (updatedGuest, { guestId, status }) => {
      await invalidateGuestQueries();
      
      // Send update to partner
      emitUpdate('guests', 'update', { guestId, status, guest: updatedGuest });
    },
  });

  const deleteAllGuestsMutation = useMutation({
    mutationFn: () => guestService.deleteAllGuests(effectiveId),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['guests', effectiveId] });
      
      // Snapshot the previous value
      const previousGuests = queryClient.getQueryData(['guests', effectiveId]);
      
      // Optimistically clear the guests list
      queryClient.setQueryData(['guests', effectiveId], []);
      
      return { previousGuests };
    },
    onError: (error, _variables, context) => {
      console.error('❌ Delete all guests failed:', error);
      // Rollback to previous data if available
      if (context?.previousGuests) {
        queryClient.setQueryData(['guests', effectiveId], context.previousGuests);
      }
    },
    onSuccess: async () => {
      await invalidateGuestQueries();
    },
  });

  const cleanupDuplicatesMutation = useMutation({
    mutationFn: () => guestService.cleanupDuplicates(effectiveId),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['guests', effectiveId] });
      
      // Snapshot the previous value
      const previousGuests = queryClient.getQueryData(['guests', effectiveId]);
      
      return { previousGuests };
    },
    onError: (error, _variables, context) => {
      console.error('❌ Cleanup duplicates failed:', error);
      // Rollback to previous data if available
      if (context?.previousGuests) {
        queryClient.setQueryData(['guests', effectiveId], context.previousGuests);
      }
    },
    onSuccess: async () => {
      await invalidateGuestQueries();
    },
  });

  const importGuestsMutation = useMutation({
    mutationFn: ({ file, onProgress }: { file: File, onProgress?: (current: number, total: number, currentName: string) => void }) => 
      guestService.importGuests(file, effectiveId, user?.sharedEventId, onProgress),
    onSuccess: async (result, _variables, _context) => {
      console.log('📊 Import completed:', result);
      
      // Immediately update the cache with the new data
      try {
        const freshData = await guestService.fetchGuests(effectiveId);
        queryClient.setQueryData(['guests', effectiveId], freshData);
        console.log('✅ Cache updated with fresh data');
      } catch (error) {
        console.error('❌ Failed to update cache:', error);
        // Fallback to simple refresh
        await simpleRefresh();
      }
    },
    onError: (error, _variables, _context) => {
      console.error('❌ Import failed:', error);
    }
  });

  // Computed values
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      // Filter by status
      if (filters.filter === 'confirmed' && guest.isConfirmed !== true) return false;
      if (filters.filter === 'declined' && guest.isConfirmed !== false) return false;
      if (filters.filter === 'pending' && guest.isConfirmed !== null) return false;

      // Filter by side
      if (filters.sideFilter !== 'all' && guest.side !== filters.sideFilter) return false;

      // Filter by search
      if (filters.searchQuery && 
          !guest.name.includes(filters.searchQuery) && 
          !guest.phoneNumber?.includes(filters.searchQuery)) return false;

      return true;
    });
  }, [guests, filters]);

  const stats = useMemo(() => {
    const confirmed = guests.filter(guest => guest.isConfirmed === true);
    const declined = guests.filter(guest => guest.isConfirmed === false);
    const pending = guests.filter(guest => guest.isConfirmed === null);
    
    const totalGuests = guests.reduce((sum, guest) => sum + guest.numberOfGuests, 0);
    const confirmedGuests = confirmed.reduce((sum, guest) => sum + guest.numberOfGuests, 0);
    
    return {
      totalCount: guests.length,
      confirmedCount: confirmed.length,
      declinedCount: declined.length,
      pendingCount: pending.length,
      totalGuests,
      confirmedGuests
    };
  }, [guests]);

  const error = queryError?.message || null;

  const value: GuestContextType = {
    guests,
    isLoading,
    error,
    filters,
    setFilters,
    addGuest: addGuestMutation.mutateAsync,
    updateGuest: updateGuestMutation.mutateAsync,
    deleteGuest: deleteGuestMutation.mutateAsync,
    confirmGuest: (guestId: string, status: boolean | null) => 
      confirmGuestMutation.mutateAsync({ guestId, status }),
    deleteAllGuests: deleteAllGuestsMutation.mutateAsync,
    forceRefresh: simpleRefresh,
    cleanupDuplicates: cleanupDuplicatesMutation.mutateAsync,
    importGuests: async (file: File, onProgress?: (current: number, total: number, currentName: string) => void) => {
      return await importGuestsMutation.mutateAsync({ file, onProgress });
    },
    filteredGuests,
    stats,
    isAddingGuest: addGuestMutation.isPending,
    isUpdatingGuest: updateGuestMutation.isPending,
    isDeletingGuest: deleteGuestMutation.isPending,
    isImportingGuests: importGuestsMutation.isPending
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuests() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuests must be used within a GuestProvider');
  }
  return context;
} 