import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GuestProvider } from '../../context/GuestContext';
import { createMockQueryClient } from '../mocks/queryClient';

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  userId?: string;
  initialFilters?: any;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = createMockQueryClient(),
    userId = 'test-user-id',
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <GuestProvider userId={userId}>
          {children}
        </GuestProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export function renderWithQueryClient(
  ui: React.ReactElement,
  queryClient: QueryClient = createMockQueryClient(),
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

// Mock API response helpers
export const mockFetch = (response: any, ok: boolean = true) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => response,
    text: async () => JSON.stringify(response),
    status: ok ? 200 : 400,
  });
};

export const mockFetchError = (error: string) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(error));
};

// Wait for async operations
export const waitForAsyncOperations = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock file operations
export const createMockFile = (name: string, content: string, type: string) => {
  return new File([content], name, { type });
};

// Mock Excel file
export const createMockExcelFile = (name: string = 'test.xlsx') => {
  return createMockFile(
    name,
    'mock excel content',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
};

// Utility to trigger file input change
export const triggerFileInputChange = (input: HTMLInputElement, files: File[]) => {
  Object.defineProperty(input, 'files', {
    value: files,
    configurable: true,
  });
  
  const event = new Event('change', { bubbles: true });
  input.dispatchEvent(event);
};

// Test utilities for form interactions
export const fillForm = (container: HTMLElement, data: Record<string, string>) => {
  Object.entries(data).forEach(([name, value]) => {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
};

// Mock console methods for testing
export const mockConsole = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();

  return {
    restore: () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    },
    error: console.error as jest.Mock,
    warn: console.warn as jest.Mock,
    log: console.log as jest.Mock,
  };
}; 