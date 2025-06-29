import { useQuery } from '@tanstack/react-query';
import { guestService } from '../services/guestService';

// This file is for checklist queries only
// Guest queries are handled in GuestContext.tsx

export {}; // Make this an ES module

export function useGuestQuery(userId: string) {
  return useQuery({
    queryKey: ['guests', userId],
    queryFn: () => guestService.fetchGuests(userId),
    staleTime: 0, // Always consider data stale for immediate updates
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
} 