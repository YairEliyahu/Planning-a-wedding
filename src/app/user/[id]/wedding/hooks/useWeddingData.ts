import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weddingService } from '../services/weddingService';
import { WeddingPreferences, UserProfile } from '../types/wedding.types';

// Query keys for React Query
export const WEDDING_QUERY_KEYS = {
  all: ['wedding'] as const,
  weddingData: (userId: string) => [...WEDDING_QUERY_KEYS.all, 'data', userId] as const,
  profile: (userId: string) => [...WEDDING_QUERY_KEYS.all, 'profile', userId] as const,
  preferences: (userId: string) => [...WEDDING_QUERY_KEYS.all, 'preferences', userId] as const,
} as const;

/**
 * Hook to fetch wedding data (profile + preferences)
 */
export function useWeddingData(userId: string) {
  return useQuery({
    queryKey: WEDDING_QUERY_KEYS.weddingData(userId),
    queryFn: () => weddingService.getWeddingData(userId),
    enabled: !!userId, // Only run query if userId exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

/**
 * Hook to fetch user profile only
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: WEDDING_QUERY_KEYS.profile(userId),
    queryFn: () => weddingService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch wedding preferences only
 */
export function useWeddingPreferences(userId: string) {
  return useQuery({
    queryKey: WEDDING_QUERY_KEYS.preferences(userId),
    queryFn: () => weddingService.getWeddingPreferences(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to save wedding data (mutations)
 */
export function useSaveWeddingData(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: WeddingPreferences) => 
      weddingService.saveWeddingData(userId, preferences),
    onSuccess: (data) => {
      // Update the cached wedding data
      queryClient.setQueryData(
        WEDDING_QUERY_KEYS.weddingData(userId),
        (old: { profile: UserProfile; preferences: WeddingPreferences } | undefined) => {
          if (!old) return old;
          return {
            profile: data.profile,
            preferences: {
              venueType: data.preferences.venueType,
              timeOfDay: data.preferences.timeOfDay,
              locationPreference: data.preferences.locationPreference,
              guestsCount: data.profile.expectedGuests || '',
            },
          };
        }
      );

      // Also update individual caches
      queryClient.setQueryData(WEDDING_QUERY_KEYS.profile(userId), data.profile);
      queryClient.setQueryData(WEDDING_QUERY_KEYS.preferences(userId), data.preferences);

      // Invalidate related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: WEDDING_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      console.error('Failed to save wedding data:', error);
    },
  });
}

/**
 * Hook to invalidate and refetch wedding data
 */
export function useRefreshWeddingData() {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      return queryClient.invalidateQueries({
        queryKey: WEDDING_QUERY_KEYS.all,
      });
    },
    refreshWeddingData: (userId: string) => {
      return queryClient.invalidateQueries({
        queryKey: WEDDING_QUERY_KEYS.weddingData(userId),
      });
    },
    clearCache: () => {
      queryClient.removeQueries({
        queryKey: WEDDING_QUERY_KEYS.all,
      });
    },
  };
}

/**
 * Hook for auto-refresh functionality (for connected users)
 */
export function useAutoRefreshWeddingData(userId: string, isConnectedUser: boolean) {
  const { refreshWeddingData, clearCache } = useRefreshWeddingData();

  // Set up auto-refresh for connected users
  React.useEffect(() => {
    if (!isConnectedUser || !userId) return;

    console.log(`Setting up auto-refresh for connected user ${userId}`);

    // Initial refresh after 5 seconds
    const initialTimeout = setTimeout(() => {
      console.log('Initial refresh of wedding data for connected accounts');
      clearCache(); // Clear cache to force fresh data
      refreshWeddingData(userId);
    }, 5000);

    // Set up interval for every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing wedding data for connected accounts...');
      clearCache(); // Clear cache to force fresh data
      refreshWeddingData(userId);
    }, 30000);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(refreshInterval);
    };
  }, [userId, isConnectedUser, refreshWeddingData, clearCache]);
}

// Re-export types for convenience
export type { WeddingPreferences, UserProfile }; 