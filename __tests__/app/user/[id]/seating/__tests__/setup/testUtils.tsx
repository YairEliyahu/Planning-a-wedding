import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SeatingProvider } from '../../context/SeatingContext';

// Create a new QueryClient for each test to avoid state leaking
const createTestQueryClient = () => 
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper for tests that need only QueryClient
export const QueryWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Wrapper for tests that need both QueryClient and SeatingContext
export const SeatingWrapper = ({ 
  children, 
  userId = 'test-user-123' 
}: { 
  children: React.ReactNode;
  userId?: string;
}) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SeatingProvider userId={userId}>
        {children}
      </SeatingProvider>
    </QueryClientProvider>
  );
};

// Custom render function for seating components
export const renderWithSeating = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { userId?: string }
) => {
  const { userId, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <SeatingWrapper userId={userId}>{children}</SeatingWrapper>
    ),
    ...renderOptions,
  });
};

// Custom render function for query-only components
export const renderWithQuery = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: QueryWrapper,
    ...options,
  });
};

// Test data factories
export const createMockGuest = (overrides = {}) => ({
  _id: 'guest-123',
  userId: 'user-123',
  name: 'אורח טסט',
  phoneNumber: '050-1234567',
  numberOfGuests: 1,
  side: 'חתן' as const,
  isConfirmed: true,
  notes: '',
  group: 'משפחה',
  ...overrides,
});

export const createMockTable = (overrides = {}) => ({
  id: 'table-1',
  name: 'שולחן 1',
  capacity: 12,
  shape: 'round' as const,
  x: 100,
  y: 100,
  guests: [],
  ...overrides,
});

export const createMockApiGuest = (overrides = {}) => ({
  _id: 'guest-123',
  userId: 'user-123',
  name: 'אורח טסט',
  phoneNumber: '050-1234567',
  numberOfGuests: 1,
  side: 'חתן' as const,
  isConfirmed: true,
  notes: '',
  group: 'משפחה',
  ...overrides,
});

// Mock event setup data
export const createMockEventSetup = (overrides = {}) => ({
  guestCount: 120,
  tableType: 'regular' as const,
  customCapacity: undefined,
  knightTablesCount: undefined,
  ...overrides,
});

// Helper to wait for queries to settle
export const waitForQueryToSettle = () => 
  new Promise(resolve => setTimeout(resolve, 0)); 