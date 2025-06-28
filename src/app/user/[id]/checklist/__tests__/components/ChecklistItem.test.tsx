import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ChecklistItem from '../../components/ChecklistItem';
import { useChecklistContext } from '../../context/ChecklistContext';
import { ChecklistItem as ChecklistItemType } from '../../types';
import * as checklistUtils from '../../utils/checklistUtils';

// Mock the context
jest.mock('../../context/ChecklistContext');

// Mock the utils
jest.mock('../../utils/checklistUtils', () => ({
  getPriorityClass: jest.fn(),
  getPriorityLabel: jest.fn(),
  validateNumericInput: jest.fn((value) => value),
}));

describe('🎯 ChecklistItem Component', () => {
  const mockContextValue = {
    toggleItem: jest.fn(),
    updateBudget: jest.fn(),
    updateGuestCount: jest.fn(),
    updateAverageGift: jest.fn(),
    updateCostPerPerson: jest.fn(),
  };

  const mockRegularItem: ChecklistItemType = {
    id: '2',
    name: 'צלם חתונה',
    category: 'תיעוד',
    subCategory: 'צילום',
    isCompleted: false,
    budget: '5000',
    priority: 'high'
  };

  const mockVenueItem: ChecklistItemType = {
    id: '1', // Venue item has id '1'
    name: 'בחירת אולם',
    category: 'מקום האירוע',
    subCategory: 'כללי',
    isCompleted: false,
    budget: '50000',
    priority: 'high',
    guestCount: 100,
    averageGift: 500,
    costPerPerson: 400
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useChecklistContext as jest.Mock).mockReturnValue(mockContextValue);
    (checklistUtils.getPriorityClass as jest.Mock).mockReturnValue('bg-red-100 text-red-800');
    (checklistUtils.getPriorityLabel as jest.Mock).mockReturnValue('חשוב');
  });

  describe('📋 Regular Item Rendering', () => {
    it('✅ should render regular item correctly', () => {
      render(<ChecklistItem item={mockRegularItem} />);

      expect(screen.getByText('צלם חתונה')).toBeInTheDocument();
      expect(screen.getByText('צילום')).toBeInTheDocument();
      expect(screen.getByText('חשוב')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('תקציב')).toBeInTheDocument();
    });

    it('✅ should render completed item with correct styles', () => {
      const completedItem = { ...mockRegularItem, isCompleted: true };
      render(<ChecklistItem item={completedItem} />);

      const itemName = screen.getByText('צלם חתונה');
      expect(itemName).toHaveClass('line-through', 'text-gray-500');
    });

    it('✅ should show priority badge with correct classes', () => {
      render(<ChecklistItem item={mockRegularItem} />);

      expect(checklistUtils.getPriorityClass).toHaveBeenCalledWith('high');
      expect(checklistUtils.getPriorityLabel).toHaveBeenCalledWith('high');
      
      const priorityBadge = screen.getByText('חשוב');
      expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('✅ should not show priority badge when priority is missing', () => {
      const itemWithoutPriority = { ...mockRegularItem, priority: undefined };
      render(<ChecklistItem item={itemWithoutPriority} />);

      expect(screen.queryByText('חשוב')).not.toBeInTheDocument();
    });
  });

  describe('🏛️ Venue Item Rendering', () => {
    it('✅ should render venue item with special fields', () => {
      render(<ChecklistItem item={mockVenueItem} />);

      expect(screen.getByPlaceholderText('כמות אורחים')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('מחיר למנה')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ממוצע למעטפה')).toBeInTheDocument();
      
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('400')).toBeInTheDocument();
      expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });

    it('✅ should show empty fields when venue values are zero', () => {
      const venueItemWithZeros = {
        ...mockVenueItem,
        guestCount: 0,
        averageGift: 0,
        costPerPerson: 0
      };
      
      render(<ChecklistItem item={venueItemWithZeros} />);

      const guestInput = screen.getByPlaceholderText('כמות אורחים');
      const averageGiftInput = screen.getByPlaceholderText('ממוצע למעטפה');
      const costPerPersonInput = screen.getByPlaceholderText('מחיר למנה');

      expect(guestInput).toHaveValue(null);
      expect(averageGiftInput).toHaveValue(null);
      expect(costPerPersonInput).toHaveValue('');
    });
  });

  describe('🔄 User Interactions', () => {
    it('✅ should toggle item completion when checkbox is clicked', () => {
      render(<ChecklistItem item={mockRegularItem} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockContextValue.toggleItem).toHaveBeenCalledWith('2');
    });

    it('✅ should update budget when regular item budget changes', () => {
      render(<ChecklistItem item={mockRegularItem} />);

      const budgetInput = screen.getByPlaceholderText('תקציב');
      fireEvent.change(budgetInput, { target: { value: '7500' } });

      expect(mockContextValue.updateBudget).toHaveBeenCalledWith('2', '7500');
    });

    it('✅ should update guest count for venue item', () => {
      render(<ChecklistItem item={mockVenueItem} />);

      const guestInput = screen.getByPlaceholderText('כמות אורחים');
      fireEvent.change(guestInput, { target: { value: '150' } });

      expect(mockContextValue.updateGuestCount).toHaveBeenCalledWith('1', '150');
    });

    it('✅ should update cost per person with validation', () => {
      (checklistUtils.validateNumericInput as jest.Mock).mockReturnValue('450');
      
      render(<ChecklistItem item={mockVenueItem} />);

      const costInput = screen.getByPlaceholderText('מחיר למנה');
      fireEvent.change(costInput, { target: { value: '450' } });

      expect(checklistUtils.validateNumericInput).toHaveBeenCalledWith('450');
      expect(mockContextValue.updateCostPerPerson).toHaveBeenCalledWith('1', '450');
    });
  });

  describe('✅ Checkbox States', () => {
    it('✅ should show checked checkbox for completed item', () => {
      const completedItem = { ...mockRegularItem, isCompleted: true };
      render(<ChecklistItem item={completedItem} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('✅ should show unchecked checkbox for incomplete item', () => {
      render(<ChecklistItem item={mockRegularItem} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });
  });
});
