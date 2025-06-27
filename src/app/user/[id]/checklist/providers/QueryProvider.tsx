'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Time in milliseconds that data is considered fresh
            staleTime: 1000 * 60 * 5, // 5 minutes
            // Time that data remains in cache when unused
            gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
            // Retry failed requests
            retry: (failureCount, error: any) => {
              // Don't retry on 404s
              if (error?.status === 404) return false;
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Background refetch settings
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
          },
          mutations: {
            // Retry failed mutations
            retry: 1,
            // Global error handling could be added here
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* הצגת dev tools רק בסביבת פיתוח */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
        />
      )}
    </QueryClientProvider>
  );
} 