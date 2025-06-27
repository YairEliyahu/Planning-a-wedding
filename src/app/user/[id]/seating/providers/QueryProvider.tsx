'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client with optimized settings for seating management
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default cache time: 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 2 times
        retry: 2,
        // Retry with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus for critical data
        refetchOnWindowFocus: true,
        // Refetch when coming back online
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Show network error details
        onError: (error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  });
};

// Global query client instance
let globalQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!globalQueryClient) globalQueryClient = createQueryClient();
    return globalQueryClient;
  }
};

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}

// Custom hooks for seating-specific queries
export const useSeatingQueries = () => {
  const queryClient = getQueryClient();

  return {
    // Invalidate all seating-related queries
    invalidateSeatingQueries: (userId?: string) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['seating', userId] });
        queryClient.invalidateQueries({ queryKey: ['guests', userId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['seating'] });
        queryClient.invalidateQueries({ queryKey: ['guests'] });
      }
    },

    // Prefetch guests for better UX
    prefetchGuests: (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['guests', userId],
        queryFn: () => import('../services/guestService').then(({ guestService }) => 
          guestService.fetchGuests(userId)
        ),
      });
    },

    // Prefetch seating arrangement
    prefetchSeating: (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['seating', userId],
        queryFn: () => import('../services/seatingService').then(({ seatingService }) => 
          seatingService.fetchSeatingArrangement(userId)
        ),
      });
    },

    // Clear all cached data (useful for logout)
    clearCache: () => {
      queryClient.clear();
    },

    // Get cached data without triggering a request
    getCachedGuests: (userId: string) => {
      return queryClient.getQueryData(['guests', userId]);
    },

    getCachedSeating: (userId: string) => {
      return queryClient.getQueryData(['seating', userId]);
    },
  };
};

export default QueryProvider; 