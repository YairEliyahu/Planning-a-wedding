'use client';

import { createContext, useContext, ReactNode, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
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
  addGuest: (guest: NewGuest) => Promise<void>;
  updateGuest: (guest: Guest) => Promise<void>;
  deleteGuest: (guestId: string) => Promise<void>;
  confirmGuest: (guestId: string, status: boolean | null) => Promise<void>;
  deleteAllGuests: () => Promise<{ deletedCount: number }>;
  forceRefresh: () => Promise<void>;
  cleanupDuplicates: () => Promise<{ removedCount: number }>;
  importGuests: (file: File) => Promise<void>;
  filteredGuests: Guest[];
  stats: {
    totalCount: number;
    confirmedCount: number;
    declinedCount: number;
    pendingCount: number;
    totalGuests: number;
    confirmedGuests: number;
  };
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

interface GuestProviderProps {
  children: ReactNode;
  userId: string;
}

export function GuestProvider({ children, userId }: GuestProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['guests', userId],
    queryFn: () => guestService.fetchGuests(userId),
    refetchInterval: user?.connectedUserId ? 15000 : false, // Auto-refresh for connected accounts
    staleTime: 30000,
  });

  // Mutations
  const addGuestMutation = useMutation({
    mutationFn: (guest: NewGuest) => guestService.addGuest({ ...guest, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: (guest: Guest) => guestService.updateGuest(guest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: (guestId: string) => guestService.deleteGuest(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const confirmGuestMutation = useMutation({
    mutationFn: ({ guestId, status }: { guestId: string; status: boolean | null }) =>
      guestService.confirmGuest(guestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const deleteAllGuestsMutation = useMutation({
    mutationFn: () => guestService.deleteAllGuests(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const cleanupDuplicatesMutation = useMutation({
    mutationFn: () => guestService.cleanupDuplicates(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
  });

  const importGuestsMutation = useMutation({
    mutationFn: (file: File) => guestService.importGuests(file, userId, user?.sharedEventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', userId] });
    },
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
    forceRefresh: () => refetch().then(() => {}),
    cleanupDuplicates: cleanupDuplicatesMutation.mutateAsync,
    importGuests: importGuestsMutation.mutateAsync,
    filteredGuests,
    stats
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