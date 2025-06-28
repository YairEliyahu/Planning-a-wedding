import { render, screen, fireEvent } from '@testing-library/react';
import ChecklistCategory from '../../components/ChecklistCategory';
import { useChecklistContext } from '../../context/ChecklistContext';
import { Category } from '../../types';

// Mock the context
jest.mock('../../context/ChecklistContext');
jest.mock('../../components/ChecklistItem', () => {
  return function MockChecklistItem({ item }: any) {
    return <div data-testid={`item-${item.id}`}>{item.name}</div>;
  };
});

describe('📂 ChecklistCategory Component', () => {
  const mockContextValue = {
    toggleCategory: jest.fn(),
    addItem: jest.fn(),
    isAddingItem: false,
    selectedCategory: '',
    newItemName: '',
    setIsAddingItem: jest.fn(),
    setSelectedCategory: jest.fn(),
    setNewItemName: jest.fn(),
    filters: {
      filter: 'all' as const,
      sortBy: 'name' as const
    },
  };

  const mockCategory: Category = {
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
        priority: 'high'
      },
      {
        id: '2',
        name: 'קישוטים',
        category: 'מקום האירוע',
        subCategory: 'כללי',
        isCompleted: true,
        budget: '10000',
        priority: 'medium'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useChecklistContext as jest.Mock).mockReturnValue(mockContextValue);
  });

  describe('📋 Category Rendering', () => {
    it('✅ should render category name and toggle button', () => {
      render(<ChecklistCategory category={mockCategory} />);

      expect(screen.getByText('מקום האירוע')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle category/i })).toBeInTheDocument();
    });

    it('✅ should render all items when expanded', () => {
      render(<ChecklistCategory category={mockCategory} />);

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByText('בחירת אולם')).toBeInTheDocument();
      expect(screen.getByText('קישוטים')).toBeInTheDocument();
    });

    it('✅ should not render items when collapsed', () => {
      const collapsedCategory = { ...mockCategory, isExpanded: false };
      render(<ChecklistCategory category={collapsedCategory} />);

      expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
    });

    it('✅ should show correct expand/collapse icon', () => {
      const { rerender } = render(<ChecklistCategory category={mockCategory} />);

      // Expanded - should show chevron down
      const expandedIcon = screen.getByTestId('chevron-icon');
      expect(expandedIcon).toBeInTheDocument();

      // Collapsed - should show chevron right
      const collapsedCategory = { ...mockCategory, isExpanded: false };
      rerender(<ChecklistCategory category={collapsedCategory} />);

      const collapsedIcon = screen.getByTestId('chevron-icon');
      expect(collapsedIcon).toBeInTheDocument();
    });
  });

  describe('🔄 Toggle Functionality', () => {
    it('✅ should call toggleCategory when header is clicked', () => {
      render(<ChecklistCategory category={mockCategory} />);

      const toggleButton = screen.getByRole('button', { name: /toggle category/i });
      fireEvent.click(toggleButton);

      expect(mockContextValue.toggleCategory).toHaveBeenCalledWith('מקום האירוע');
    });
  });

  describe('➕ Add Item Functionality', () => {
    it('✅ should show add item button for expanded category', () => {
      render(<ChecklistCategory category={mockCategory} />);

      expect(screen.getByText('הוספת פריט חדש')).toBeInTheDocument();
    });

    it('✅ should not show add item button for collapsed category', () => {
      const collapsedCategory = { ...mockCategory, isExpanded: false };
      render(<ChecklistCategory category={collapsedCategory} />);

      expect(screen.queryByText('הוספת פריט חדש')).not.toBeInTheDocument();
    });

    it('✅ should show add form when adding item for this category', () => {
      const contextWithAddingItem = {
        ...mockContextValue,
        isAddingItem: true,
        selectedCategory: 'מקום האירוע'
      };
      (useChecklistContext as jest.Mock).mockReturnValue(contextWithAddingItem);

      render(<ChecklistCategory category={mockCategory} />);

      expect(screen.getByPlaceholderText('שם הפריט החדש')).toBeInTheDocument();
      expect(screen.getByText('הוסף')).toBeInTheDocument();
      expect(screen.getByText('ביטול')).toBeInTheDocument();
    });

    it('✅ should not show add form when adding item for different category', () => {
      const contextWithAddingItem = {
        ...mockContextValue,
        isAddingItem: true,
        selectedCategory: 'קייטרינג'
      };
      (useChecklistContext as jest.Mock).mockReturnValue(contextWithAddingItem);

      render(<ChecklistCategory category={mockCategory} />);

      expect(screen.queryByPlaceholderText('שם הפריט החדש')).not.toBeInTheDocument();
    });

    it('✅ should trigger add item form when add button is clicked', () => {
      render(<ChecklistCategory category={mockCategory} />);

      const addButton = screen.getByText('הוספת פריט חדש');
      fireEvent.click(addButton);

      expect(mockContextValue.setSelectedCategory).toHaveBeenCalledWith('מקום האירוע');
      expect(mockContextValue.setIsAddingItem).toHaveBeenCalledWith(true);
    });
  });

  describe('📝 Add Item Form', () => {
    beforeEach(() => {
      const contextWithAddingItem = {
        ...mockContextValue,
        isAddingItem: true,
        selectedCategory: 'מקום האירוע',
        newItemName: 'פריט חדש'
      };
      (useChecklistContext as jest.Mock).mockReturnValue(contextWithAddingItem);
    });

    it('✅ should call setNewItemName when input changes', () => {
      render(<ChecklistCategory category={mockCategory} />);

      const input = screen.getByPlaceholderText('שם הפריט החדש');
      fireEvent.change(input, { target: { value: 'פריט מעודכן' } });

      expect(mockContextValue.setNewItemName).toHaveBeenCalledWith('פריט מעודכן');
    });

    it('✅ should call addItem when add button is clicked', () => {
      render(<ChecklistCategory category={mockCategory} />);

      const addBtn = screen.getByText('הוסף');
      fireEvent.click(addBtn);

      expect(mockContextValue.addItem).toHaveBeenCalledWith('מקום האירוע');
    });

    it('✅ should cancel add item when cancel button is clicked', () => {
      render(<ChecklistCategory category={mockCategory} />);

      const cancelBtn = screen.getByText('ביטול');
      fireEvent.click(cancelBtn);

      expect(mockContextValue.setIsAddingItem).toHaveBeenCalledWith(false);
      expect(mockContextValue.setSelectedCategory).toHaveBeenCalledWith('');
      expect(mockContextValue.setNewItemName).toHaveBeenCalledWith('');
    });

    it('✅ should submit form on Enter key press', () => {
      render(<ChecklistCategory category={mockCategory} />);

      const input = screen.getByPlaceholderText('שם הפריט החדש');
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(mockContextValue.addItem).toHaveBeenCalledWith('מקום האירוע');
    });
  });

  describe('📊 Category Statistics', () => {
    it('✅ should show progress indicator', () => {
      render(<ChecklistCategory category={mockCategory} />);

      // Should show completion status (1 of 2 completed)
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('✅ should handle empty category', () => {
      const emptyCategory = { ...mockCategory, items: [] };
      render(<ChecklistCategory category={emptyCategory} />);

      expect(screen.getByText('0/0')).toBeInTheDocument();
    });
  });

  describe('🎨 Styling and Classes', () => {
    it('✅ should apply correct styling for expanded category', () => {
      render(<ChecklistCategory category={mockCategory} />);

      const categoryContainer = screen.getByText('מקום האירוע').closest('.border');
      expect(categoryContainer).toHaveClass('rounded-lg');
    });

    it('✅ should show completed items count in progress', () => {
      render(<ChecklistCategory category={mockCategory} />);

      // One item is completed out of two
      const progressText = screen.getByText('1/2');
      expect(progressText).toBeInTheDocument();
    });
  });

  describe('🎯 Edge Cases', () => {
    it('✅ should handle category with no items', () => {
      const emptyCategory = { ...mockCategory, items: [] };
      render(<ChecklistCategory category={emptyCategory} />);

      expect(screen.getByText('מקום האירוע')).toBeInTheDocument();
      expect(screen.getByText('0/0')).toBeInTheDocument();
    });

    it('✅ should handle category with undefined items', () => {
      const categoryWithUndefinedItems = { ...mockCategory, items: undefined as any };
      
      expect(() => {
        render(<ChecklistCategory category={categoryWithUndefinedItems} />);
      }).not.toThrow();
    });
  });
}); 