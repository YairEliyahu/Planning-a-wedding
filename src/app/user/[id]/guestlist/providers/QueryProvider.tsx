'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
        retry: 2,
        refetchOnWindowFocus: false, // Disable to prevent excessive refetches
        refetchOnMount: false, // Disable to prevent excessive refetches
        gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 