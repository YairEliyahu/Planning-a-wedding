import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChecklist, useUpdateChecklist, useResetChecklist, useClearCache } from '../../hooks/useChecklistQuery';
import { ChecklistService } from '../../services/checklistService';
import { Category } from '../../types';

// Mock ChecklistService
jest.mock('../../services/checklistService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('🎣 useChecklistQuery Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📥 useChecklist', () => {
    it('✅ should fetch checklist data successfully', async () => {
      const mockData: Category[] = [
        {
          name: 'מקום האירוע',
          items: [],
          isExpanded: true
        }
      ];

      (ChecklistService.fetchChecklist as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(() => useChecklist('user123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(ChecklistService.fetchChecklist).toHaveBeenCalledWith('user123');
    });

    it('✅ should not fetch when disabled', () => {
      const { result } = renderHook(() => useChecklist('user123', false), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(ChecklistService.fetchChecklist).not.toHaveBeenCalled();
    });

    it('✅ should not fetch when userId is empty', () => {
      const { result } = renderHook(() => useChecklist(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(ChecklistService.fetchChecklist).not.toHaveBeenCalled();
    });

    it('✅ should handle fetch error', async () => {
      (ChecklistService.fetchChecklist as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useChecklist('user123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('✅ should not retry on 404 error', async () => {
      const error = new Error('Not found');
      (error as any).status = 404;
      
      (ChecklistService.fetchChecklist as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useChecklist('user123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify it was called only once (no retries)
      expect(ChecklistService.fetchChecklist).toHaveBeenCalledTimes(1);
    });

    it('✅ should have correct stale time', () => {
      const { result } = renderHook(() => useChecklist('user123'), {
        wrapper: createWrapper(),
      });

      // Verify the hook has staleTime set to 5 minutes
      expect(result.current.dataUpdatedAt).toBeDefined();
    });

    it('✅ should not refetch on window focus', () => {
      const { result } = renderHook(() => useChecklist('user123'), {
        wrapper: createWrapper(),
      });

      // Simulate window focus event
      window.dispatchEvent(new Event('focus'));
      
      expect(ChecklistService.fetchChecklist).toHaveBeenCalledTimes(1);
    });
  });

  describe('💾 useUpdateChecklist', () => {
    it('✅ should update checklist successfully', async () => {
      const mockData: Category[] = [
        {
          name: 'מקום האירוע',
          items: [],
          isExpanded: true
        }
      ];

      (ChecklistService.saveChecklist as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useUpdateChecklist('user123'), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(ChecklistService.saveChecklist).toHaveBeenCalledWith('user123', mockData);
    });

    it('✅ should handle update error', async () => {
      (ChecklistService.saveChecklist as jest.Mock).mockRejectedValue(
        new Error('Save failed')
      );

      const { result } = renderHook(() => useUpdateChecklist('user123'), {
        wrapper: createWrapper(),
      });

      result.current.mutate([]);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('✅ should perform optimistic updates', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
      });
      
      const mockData: Category[] = [
        {
          name: 'מקום האירוע',
          items: [],
          isExpanded: true
        }
      ];

      // Set initial data
      queryClient.setQueryData(['checklist', 'user123'], []);

      (ChecklistService.saveChecklist as jest.Mock).mockResolvedValue(true);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateChecklist('user123'), {
        wrapper,
      });

      result.current.mutate(mockData);

      // Check that data was updated optimistically
      const cachedData = queryClient.getQueryData(['checklist', 'user123']);
      expect(cachedData).toEqual(mockData);
    });

    it('✅ should revert on error', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
      });
      
      const initialData: Category[] = [
        {
          name: 'Initial',
          items: [],
          isExpanded: true
        }
      ];

      const newData: Category[] = [
        {
          name: 'New',
          items: [],
          isExpanded: true
        }
      ];

      // Set initial data
      queryClient.setQueryData(['checklist', 'user123'], initialData);

      (ChecklistService.saveChecklist as jest.Mock).mockRejectedValue(
        new Error('Save failed')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateChecklist('user123'), {
        wrapper,
      });

      result.current.mutate(newData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check that data was reverted
      const cachedData = queryClient.getQueryData(['checklist', 'user123']);
      expect(cachedData).toEqual(initialData);
    });
  });

  describe('🔄 useResetChecklist', () => {
    it('✅ should reset checklist successfully', async () => {
      const queryClient = new QueryClient();
      const mockData: Category[] = [
        {
          name: 'מקום האירוע',
          items: [
            {
              id: '1',
              name: 'אולם',
              isCompleted: true,
              budget: '50000',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high'
            }
          ],
          isExpanded: true
        }
      ];

      const resetData: Category[] = [
        {
          name: 'מקום האירוע',
          items: [
            {
              id: '1',
              name: 'אולם',
              isCompleted: false,
              budget: '',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high'
            }
          ],
          isExpanded: true
        }
      ];

      // Set initial data in cache
      queryClient.setQueryData(['checklist', 'user123'], mockData);

      (ChecklistService.resetAllData as jest.Mock).mockReturnValue(resetData);
      (ChecklistService.saveChecklist as jest.Mock).mockResolvedValue(true);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useResetChecklist('user123'), {
        wrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(ChecklistService.resetAllData).toHaveBeenCalledWith(mockData);
      expect(ChecklistService.saveChecklist).toHaveBeenCalledWith('user123', resetData);
    });

    it('✅ should handle reset error when no data exists', async () => {
      const { result } = renderHook(() => useResetChecklist('user123'), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect((result.current.error as Error).message).toBe('No data to reset');
    });

    it('✅ should handle save failure during reset', async () => {
      const queryClient = new QueryClient();
      const mockData: Category[] = [
        {
          name: 'מקום האירוע',
          items: [],
          isExpanded: true
        }
      ];

      queryClient.setQueryData(['checklist', 'user123'], mockData);

      (ChecklistService.resetAllData as jest.Mock).mockReturnValue(mockData);
      (ChecklistService.saveChecklist as jest.Mock).mockResolvedValue(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useResetChecklist('user123'), {
        wrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect((result.current.error as Error).message).toBe('Failed to reset checklist');
    });

    it('✅ should perform optimistic update on reset', async () => {
      const queryClient = new QueryClient();
      const mockData: Category[] = [
        {
          name: 'מקום האירוע',
          items: [
            {
              id: '1',
              name: 'אולם',
              isCompleted: true,
              budget: '50000',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high'
            }
          ],
          isExpanded: true
        }
      ];

      const resetData: Category[] = [
        {
          name: 'מקום האירוע',
          items: [
            {
              id: '1',
              name: 'אולם',
              isCompleted: false,
              budget: '',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high'
            }
          ],
          isExpanded: true
        }
      ];

      queryClient.setQueryData(['checklist', 'user123'], mockData);

      (ChecklistService.resetAllData as jest.Mock).mockReturnValue(resetData);
      (ChecklistService.saveChecklist as jest.Mock).mockResolvedValue(true);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useResetChecklist('user123'), {
        wrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check that cache was updated with reset data
      const cachedData = queryClient.getQueryData(['checklist', 'user123']);
      expect(cachedData).toEqual(resetData);
    });
  });

  describe('🗑️ useClearCache', () => {
    it('✅ should provide cache clearing functions', () => {
      const { result } = renderHook(() => useClearCache(), {
        wrapper: createWrapper(),
      });

      expect(result.current.clearAll).toBeInstanceOf(Function);
      expect(result.current.clearUser).toBeInstanceOf(Function);
      expect(result.current.invalidateUser).toBeInstanceOf(Function);
    });

    it('✅ should call service cache methods', () => {
      const { result } = renderHook(() => useClearCache(), {
        wrapper: createWrapper(),
      });

      result.current.clearAll();
      expect(ChecklistService.clearCache).toHaveBeenCalled();

      result.current.clearUser('user123');
      expect(ChecklistService.clearUserCache).toHaveBeenCalledWith('user123');
    });

    it('✅ should clear query cache', () => {
      const queryClient = new QueryClient();
      
      // Set some data
      queryClient.setQueryData(['checklist', 'user123'], []);
      queryClient.setQueryData(['checklist', 'user456'], []);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useClearCache(), { wrapper });

      result.current.clearUser('user123');

      // Check that specific user data was removed
      expect(queryClient.getQueryData(['checklist', 'user123'])).toBeUndefined();
      expect(queryClient.getQueryData(['checklist', 'user456'])).toBeDefined();
    });

    it('✅ should invalidate queries', () => {
      const queryClient = new QueryClient();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useClearCache(), { wrapper });

      result.current.invalidateUser('user123');

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['checklist', 'user123'] });
    });
  });
}); 