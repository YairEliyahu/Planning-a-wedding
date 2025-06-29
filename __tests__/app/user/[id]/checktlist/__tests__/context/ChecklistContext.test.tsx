/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChecklistProvider, useChecklistContext } from '../../context/ChecklistContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChecklistService } from '../../services/checklistService';
import { Category } from '../../types';
import * as useChecklistQueryModule from '../../hooks/useChecklistQuery';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('../../services/checklistService');
jest.mock('../../hooks/useChecklistQuery', () => ({
  useChecklist: jest.fn(),
  useUpdateChecklist: jest.fn(),
  useResetChecklist: jest.fn(),
  useClearCache: jest.fn(),
}));

const mockCategories: Category[] = [
  {
    name: 'מקום האירוע',
    isExpanded: true,
    items: [
      {
        id: '1',
        name: 'בחירת אולם',
        category: 'מקום האירוע',
        subCategory: 'כללי',
        isCompleted: false,
        budget: '50000',
        priority: 'high',
        guestCount: 100,
        averageGift: 500,
        costPerPerson: 400
      },
      {
        id: '2',
        name: 'קישוטים',
        category: 'מקום האירוע',
        subCategory: 'כללי',
        isCompleted: false,
        budget: '10000',
        priority: 'medium'
      }
    ]
  }
];

// Test component that uses the context
const TestComponent = () => {
  const context = useChecklistContext();
  
  return (
    <div>
      <div data-testid="categories-count">{context.categories.length}</div>
      <div data-testid="total-budget">{context.summary.totalBudget}</div>
      <div data-testid="progress">{context.summary.progress}</div>
      <div data-testid="is-loading">{context.isLoading.toString()}</div>
      <div data-testid="error">{context.error}</div>
      <div data-testid="filter">{context.filters.filter}</div>
      <div data-testid="sort-by">{context.filters.sortBy}</div>
      <div data-testid="expected-income">{context.expectedIncome}</div>
      <div data-testid="venue-total-cost">{context.venueTotalCost}</div>
      
      <button 
        data-testid="toggle-item-btn" 
        onClick={() => context.toggleItem('1')}
      >
        Toggle Item
      </button>
      
      <button 
        data-testid="add-item-btn" 
        onClick={() => {
          context.setSelectedCategory('מקום האירוע');
          context.setNewItemName('פריט חדש');
          context.addItem('מקום האירוע');
        }}
      >
        Add Item
      </button>
      
      <button 
        data-testid="reset-btn" 
        onClick={() => context.resetChecklist()}
      >
        Reset
      </button>
      
      <button 
        data-testid="set-filter-btn" 
        onClick={() => context.setFilter('completed')}
      >
        Set Filter
      </button>
      
      <button 
        data-testid="set-sort-btn" 
        onClick={() => context.setSortBy('name')}
      >
        Set Sort
      </button>
    </div>
  );
};

const createWrapper = (userId = 'user123') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ChecklistProvider userId={userId}>
        {children}
      </ChecklistProvider>
    </QueryClientProvider>
  );
  
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

describe('🏗️ ChecklistContext', () => {
  const mockUpdateMutation = {
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null
  };
  
  const mockResetMutation = {
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null
  };
  
  const mockClearCache = {
    clearUser: jest.fn(),
    invalidateUser: jest.fn(),
    clearAll: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        _id: 'user123',
        email: 'test@example.com',
        fullName: 'Test User'
      }
    });

    // Mock ChecklistService
    (ChecklistService.calculateSummary as jest.Mock).mockReturnValue({
      totalBudget: 60000,
      progress: 0,
      expectedIncome: 50000,
      venueTotalCost: 40000,
      totalExpenses: 60000,
      balance: -10000,
      isProfit: false
    });

    // Mock hooks
    (useChecklistQueryModule.useChecklist as jest.Mock).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null
    });
    (useChecklistQueryModule.useUpdateChecklist as jest.Mock).mockReturnValue(mockUpdateMutation);
    (useChecklistQueryModule.useResetChecklist as jest.Mock).mockReturnValue(mockResetMutation);
    (useChecklistQueryModule.useClearCache as jest.Mock).mockReturnValue(mockClearCache);
  });

  describe('🎛️ Provider Setup', () => {
    it('✅ should provide context values correctly', () => {
      render(<TestComponent />, { wrapper: createWrapper() });

      expect(screen.getByTestId('categories-count')).toHaveTextContent('1');
      expect(screen.getByTestId('total-budget')).toHaveTextContent('60000');
      expect(screen.getByTestId('progress')).toHaveTextContent('0');
      expect(screen.getByTestId('expected-income')).toHaveTextContent('50000');
      expect(screen.getByTestId('venue-total-cost')).toHaveTextContent('40000');
      expect(screen.getByTestId('filter')).toHaveTextContent('all');
      expect(screen.getByTestId('sort-by')).toHaveTextContent('priority');
    });

    it('✅ should show loading state', () => {
      (useChecklistQueryModule.useChecklist as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null
      });

      render(<TestComponent />, { wrapper: createWrapper() });

      expect(screen.getByTestId('is-loading').textContent).toBe('true');
    });

    it('✅ should handle error state', () => {
      (useChecklistQueryModule.useChecklist as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Test error')
      });

      render(<TestComponent />, { wrapper: createWrapper() });

      expect(screen.getByTestId('error')).toHaveTextContent('אירעה שגיאה בטעינת הנתונים');
    });

    it('✅ should throw error when used outside provider', () => {
      // Mock console.error to prevent error output in test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useChecklistContext must be used within a ChecklistProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('📊 Data Management', () => {
    it('✅ should calculate summary from categories', () => {
      render(<TestComponent />, { wrapper: createWrapper() });

      expect(ChecklistService.calculateSummary).toHaveBeenCalledWith(mockCategories);
      expect(screen.getByTestId('total-budget')).toHaveTextContent('60000');
    });

    it('✅ should generate chart data', () => {
      const mockGenerateChartData = jest.fn().mockReturnValue({
        labels: ['אולם', 'קישוטים'],
        datasets: [{ data: [50000, 10000] }]
      });

      jest.doMock('../../utils/checklistUtils', () => ({
        generateChartData: mockGenerateChartData
      }));

      render(<TestComponent />, { wrapper: createWrapper() });

      expect(mockGenerateChartData).toHaveBeenCalledWith(mockCategories, 50000);
    });
  });

  describe('🔄 Item Actions', () => {
    it('✅ should toggle item completion', async () => {
      (ChecklistService.updateChecklistItem as jest.Mock).mockReturnValue(mockCategories);

      render(<TestComponent />, { wrapper: createWrapper() });

      const toggleBtn = screen.getByTestId('toggle-item-btn');
      await act(async () => {
        fireEvent.click(toggleBtn);
      });

      expect(ChecklistService.updateChecklistItem).toHaveBeenCalledWith(
        mockCategories,
        '1',
        { isCompleted: true }
      );
      expect(mockUpdateMutation.mutate).toHaveBeenCalledWith(mockCategories);
    });

    it('✅ should add new item to category', async () => {
      (ChecklistService.addItemToCategory as jest.Mock).mockReturnValue(mockCategories);

      render(<TestComponent />, { wrapper: createWrapper() });

      const addBtn = screen.getByTestId('add-item-btn');
      await act(async () => {
        fireEvent.click(addBtn);
      });

      expect(ChecklistService.addItemToCategory).toHaveBeenCalledWith(
        mockCategories,
        'מקום האירוע',
        expect.objectContaining({
          name: 'פריט חדש',
          category: 'מקום האירוע',
          subCategory: 'כללי',
          isCompleted: false,
          budget: '',
          priority: 'medium'
        })
      );
      expect(mockUpdateMutation.mutate).toHaveBeenCalled();
    });

    it('✅ should reset checklist', async () => {
      render(<TestComponent />, { wrapper: createWrapper() });

      const resetBtn = screen.getByTestId('reset-btn');
      await act(async () => {
        fireEvent.click(resetBtn);
      });

      expect(mockResetMutation.mutate).toHaveBeenCalled();
    });

    it('✅ should update budget', async () => {
      (ChecklistService.updateChecklistItem as jest.Mock).mockReturnValue(mockCategories);

      const TestBudgetComponent = () => {
        const context = useChecklistContext();
        return (
          <button 
            data-testid="update-budget-btn"
            onClick={() => context.updateBudget('1', '75000')}
          >
            Update Budget
          </button>
        );
      };

      render(<TestBudgetComponent />, { wrapper: createWrapper() });

      const updateBtn = screen.getByTestId('update-budget-btn');
      await act(async () => {
        fireEvent.click(updateBtn);
      });

      expect(ChecklistService.updateChecklistItem).toHaveBeenCalledWith(
        mockCategories,
        '1',
        { budget: '75000' }
      );
    });

    it('✅ should update guest count and recalculate venue cost', async () => {
      (ChecklistService.updateChecklistItem as jest.Mock).mockReturnValue(mockCategories);

      const TestGuestComponent = () => {
        const context = useChecklistContext();
        return (
          <button 
            data-testid="update-guest-btn"
            onClick={() => context.updateGuestCount('1', '150')}
          >
            Update Guest Count
          </button>
        );
      };

      render(<TestGuestComponent />, { wrapper: createWrapper() });

      const updateBtn = screen.getByTestId('update-guest-btn');
      await act(async () => {
        fireEvent.click(updateBtn);
      });

      expect(ChecklistService.updateChecklistItem).toHaveBeenCalledWith(
        mockCategories,
        '1',
        { 
          guestCount: 150,
          budget: '60000' // 150 * 400
        }
      );
    });
  });

  describe('🎛️ Filter and Sort', () => {
    it('✅ should update filter', async () => {
      render(<TestComponent />, { wrapper: createWrapper() });

      const filterBtn = screen.getByTestId('set-filter-btn');
      await act(async () => {
        fireEvent.click(filterBtn);
      });

      expect(screen.getByTestId('filter')).toHaveTextContent('completed');
    });

    it('✅ should update sort', async () => {
      render(<TestComponent />, { wrapper: createWrapper() });

      const sortBtn = screen.getByTestId('set-sort-btn');
      await act(async () => {
        fireEvent.click(sortBtn);
      });

      expect(screen.getByTestId('sort-by')).toHaveTextContent('name');
    });
  });

  describe('🔄 Auto-refresh for Connected Users', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('✅ should setup auto-refresh for connected users', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: {
          _id: 'user123',
          connectedUserId: 'partner456'
        }
      });

      render(<TestComponent />, { wrapper: createWrapper() });

      // Fast-forward past initial delay
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      expect(mockClearCache.clearUser).toHaveBeenCalledWith('user123');
      expect(mockClearCache.invalidateUser).toHaveBeenCalledWith('user123');

      // Fast-forward to trigger interval
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockClearCache.clearUser).toHaveBeenCalledTimes(2);
      expect(mockClearCache.invalidateUser).toHaveBeenCalledTimes(2);
    });

    it('✅ should not setup auto-refresh for non-connected users', () => {
      render(<TestComponent />, { wrapper: createWrapper() });

      act(() => {
        jest.advanceTimersByTime(35000);
      });

      expect(mockClearCache.clearUser).not.toHaveBeenCalled();
      expect(mockClearCache.invalidateUser).not.toHaveBeenCalled();
    });
  });

  describe('🏗️ Component Lifecycle', () => {
    it('✅ should cleanup intervals on unmount', () => {
      jest.useFakeTimers();
      
      (useAuth as jest.Mock).mockReturnValue({
        user: {
          _id: 'user123',
          connectedUserId: 'partner456'
        }
      });

      const { unmount } = render(<TestComponent />, { wrapper: createWrapper() });

      // Setup the intervals
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      // Unmount component
      unmount();

      // Advance time and check that no more calls are made
      const initialCallCount = mockClearCache.clearUser.mock.calls.length;
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockClearCache.clearUser).toHaveBeenCalledTimes(initialCallCount);
      
      jest.useRealTimers();
    });
  });

  describe('🎯 Edge Cases', () => {
    it('✅ should handle adding item with empty name', async () => {
      const TestEmptyItemComponent = () => {
        const context = useChecklistContext();
        return (
          <button 
            data-testid="add-empty-item-btn"
            onClick={() => {
              context.setNewItemName('   '); // whitespace only
              context.addItem('מקום האירוע');
            }}
          >
            Add Empty Item
          </button>
        );
      };

      render(<TestEmptyItemComponent />, { wrapper: createWrapper() });

      const addBtn = screen.getByTestId('add-empty-item-btn');
      await act(async () => {
        fireEvent.click(addBtn);
      });

      expect(ChecklistService.addItemToCategory).not.toHaveBeenCalled();
      expect(mockUpdateMutation.mutate).not.toHaveBeenCalled();
    });

    it('✅ should handle guest count with empty string', async () => {
      (ChecklistService.updateChecklistItem as jest.Mock).mockReturnValue(mockCategories);

      const TestEmptyGuestComponent = () => {
        const context = useChecklistContext();
        return (
          <button 
            data-testid="update-empty-guest-btn"
            onClick={() => context.updateGuestCount('1', '')}
          >
            Update Empty Guest Count
          </button>
        );
      };

      render(<TestEmptyGuestComponent />, { wrapper: createWrapper() });

      const updateBtn = screen.getByTestId('update-empty-guest-btn');
      await act(async () => {
        fireEvent.click(updateBtn);
      });

      expect(ChecklistService.updateChecklistItem).toHaveBeenCalledWith(
        mockCategories,
        '1',
        { 
          guestCount: 0,
          budget: '0' // 0 * 400
        }
      );
    });

    it('✅ should handle missing item for guest count update', async () => {
      const TestMissingItemComponent = () => {
        const context = useChecklistContext();
        return (
          <button 
            data-testid="update-missing-item-btn"
            onClick={() => context.updateGuestCount('nonexistent', '100')}
          >
            Update Missing Item
          </button>
        );
      };

      render(<TestMissingItemComponent />, { wrapper: createWrapper() });

      const updateBtn = screen.getByTestId('update-missing-item-btn');
      await act(async () => {
        fireEvent.click(updateBtn);
      });

      expect(ChecklistService.updateChecklistItem).not.toHaveBeenCalled();
    });
  });
}); 