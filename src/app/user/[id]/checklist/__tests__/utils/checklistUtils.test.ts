import {
  filterAndSortItems,
  generateChartData,
  generateChartOptions,
  validateNumericInput,
  formatNumber,
  calculateCategoryProgress,
  getPriorityClass,
  getPriorityLabel
} from '../../utils/checklistUtils';
import { ChecklistItem, Category } from '../../types';

describe('🛠️ ChecklistUtils', () => {
  const mockItems: ChecklistItem[] = [
    {
      id: '1',
      name: 'צלם חתונה',
      category: 'תיעוד',
      subCategory: 'צילום',
      isCompleted: false,
      budget: '5000',
      priority: 'high'
    },
    {
      id: '2',
      name: 'שמלת כלה',
      category: 'לבוש',
      subCategory: 'שמלות',
      isCompleted: true,
      budget: '3000',
      priority: 'medium'
    },
    {
      id: '3',
      name: 'פרחים',
      category: 'קישוטים',
      subCategory: 'חופה',
      isCompleted: false,
      budget: '2000',
      priority: 'low'
    },
    {
      id: '4',
      name: 'אולם',
      category: 'מקום',
      subCategory: 'כללי',
      isCompleted: true,
      budget: '50000',
      priority: 'high'
    }
  ];

  const mockCategories: Category[] = [
    {
      name: 'מקום האירוע',
      isExpanded: true,
      items: [
        {
          id: '1',
          name: 'אולם',
          category: 'מקום האירוע',
          subCategory: 'כללי',
          isCompleted: true,
          budget: '50000',
          priority: 'high'
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
    },
    {
      name: 'קייטרינג',
      isExpanded: true,
      items: [
        {
          id: '3',
          name: 'תפריט',
          category: 'קייטרינג',
          subCategory: 'כללי',
          isCompleted: true,
          budget: '30000',
          priority: 'high'
        }
      ]
    }
  ];

  describe('🔍 filterAndSortItems', () => {
    it('✅ should return all items when filter is "all"', () => {
      const result = filterAndSortItems(mockItems, 'all', 'name');
      expect(result).toHaveLength(4);
    });

    it('✅ should filter completed items only', () => {
      const result = filterAndSortItems(mockItems, 'completed', 'name');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.isCompleted)).toBe(true);
    });

    it('✅ should filter pending items only', () => {
      const result = filterAndSortItems(mockItems, 'pending', 'name');
      expect(result).toHaveLength(2);
      expect(result.every(item => !item.isCompleted)).toBe(true);
    });

    it('✅ should sort by priority (high to low)', () => {
      const result = filterAndSortItems(mockItems, 'all', 'priority');
      expect(result[0].priority).toBe('high');
      expect(result[result.length - 1].priority).toBe('low');
    });

    it('✅ should sort by name alphabetically', () => {
      const result = filterAndSortItems(mockItems, 'all', 'name');
      expect(result[0].name).toBe('אולם');
      expect(result[1].name).toBe('פרחים');
    });

    it('✅ should sort by budget (high to low)', () => {
      const result = filterAndSortItems(mockItems, 'all', 'budget');
      expect(Number(result[0].budget)).toBe(50000);
      expect(Number(result[result.length - 1].budget)).toBe(2000);
    });

    it('✅ should handle items without priority', () => {
      const itemsWithoutPriority = [
        { ...mockItems[0], priority: undefined },
        { ...mockItems[1], priority: undefined }
      ];
      
      const result = filterAndSortItems(itemsWithoutPriority, 'all', 'priority');
      expect(result).toHaveLength(2);
    });

    it('✅ should handle empty items array', () => {
      const result = filterAndSortItems([], 'all', 'name');
      expect(result).toHaveLength(0);
    });
  });

  describe('📊 generateChartData', () => {
    it('✅ should generate chart data with correct structure', () => {
      const result = generateChartData(mockCategories, 50000);

      expect(result.labels).toContain('הכנסות צפויות');
      expect(result.labels).toContain('מקום האירוע');
      expect(result.labels).toContain('קייטרינג');
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].data).toContain(50000); // expected income
    });

    it('✅ should calculate category totals correctly', () => {
      const result = generateChartData(mockCategories, 50000);
      
      // מקום האירוע: 50000 + 10000 = 60000
      // קייטרינג: 30000
      expect(result.datasets[0].data).toContain(60000);
      expect(result.datasets[0].data).toContain(30000);
    });

    it('✅ should exclude categories with zero budget', () => {
      const categoriesWithZero = [
        ...mockCategories,
        {
          name: 'ריק',
          isExpanded: true,
          items: [
            {
              id: '4',
              name: 'פריט ללא תקציב',
              category: 'ריק',
              subCategory: 'כללי',
              isCompleted: false,
              budget: '0',
              priority: 'low'
            }
          ]
        }
      ];

      const result = generateChartData(categoriesWithZero, 50000);
      expect(result.labels).not.toContain('ריק');
    });

    it('✅ should handle empty categories', () => {
      const result = generateChartData([], 25000);
      
      expect(result.labels).toEqual(['הכנסות צפויות']);
      expect(result.datasets[0].data).toEqual([25000]);
    });

    it('✅ should have correct colors structure', () => {
      const result = generateChartData(mockCategories, 50000);
      
      expect(result.datasets[0].backgroundColor).toBeDefined();
      expect(result.datasets[0].borderColor).toBeDefined();
      expect(result.datasets[0].borderWidth).toBe(1);
    });
  });

  describe('⚙️ generateChartOptions', () => {
    it('✅ should generate options with profit scenario', () => {
      const result = generateChartOptions(100000, 80000);
      
      expect(result.plugins.legend.position).toBe('bottom');
      expect(result.plugins.legend.rtl).toBe(true);
      expect(result.maintainAspectRatio).toBe(false);
    });

    it('✅ should handle loss scenario', () => {
      const result = generateChartOptions(50000, 80000);
      
      expect(result.plugins.tooltip.callbacks.afterBody).toBeDefined();
    });

    it('✅ should format tooltip correctly', () => {
      const result = generateChartOptions(100000, 80000);
      const tooltipCallback = result.plugins.tooltip.callbacks.label;
      
      const mockContext = {
        label: 'מקום האירוע',
        raw: 50000
      };
      
      const formattedLabel = tooltipCallback(mockContext);
      expect(formattedLabel).toBe('מקום האירוע: ₪50,000');
    });
  });

  describe('✅ validateNumericInput', () => {
    it('✅ should remove non-numeric characters', () => {
      expect(validateNumericInput('abc123def')).toBe('123');
      expect(validateNumericInput('12.34')).toBe('1234');
      expect(validateNumericInput('!@#456$%^')).toBe('456');
    });

    it('✅ should handle empty string', () => {
      expect(validateNumericInput('')).toBe('');
    });

    it('✅ should handle pure numeric string', () => {
      expect(validateNumericInput('12345')).toBe('12345');
    });

    it('✅ should handle special characters', () => {
      expect(validateNumericInput('₪1,000')).toBe('1000');
    });
  });

  describe('📊 formatNumber', () => {
    it('✅ should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('✅ should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('✅ should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });
  });

  describe('📈 calculateCategoryProgress', () => {
    it('✅ should calculate progress correctly', () => {
      const category = mockCategories[0]; // 1 completed out of 2 items
      const progress = calculateCategoryProgress(category);
      expect(progress).toBe(50);
    });

    it('✅ should return 100 for fully completed category', () => {
      const category = mockCategories[1]; // 1 completed out of 1 item
      const progress = calculateCategoryProgress(category);
      expect(progress).toBe(100);
    });

    it('✅ should return 0 for empty category', () => {
      const emptyCategory: Category = {
        name: 'Empty',
        isExpanded: true,
        items: []
      };
      const progress = calculateCategoryProgress(emptyCategory);
      expect(progress).toBe(0);
    });

    it('✅ should handle category with undefined items', () => {
      const categoryWithUndefinedItems: Category = {
        name: 'Undefined',
        isExpanded: true,
        items: undefined as any
      };
      const progress = calculateCategoryProgress(categoryWithUndefinedItems);
      expect(progress).toBe(0);
    });
  });

  describe('🎨 getPriorityClass', () => {
    it('✅ should return correct classes for each priority', () => {
      expect(getPriorityClass('high')).toBe('bg-red-100 text-red-800');
      expect(getPriorityClass('medium')).toBe('bg-yellow-100 text-yellow-800');
      expect(getPriorityClass('low')).toBe('bg-green-100 text-green-800');
    });

    it('✅ should return default class for undefined priority', () => {
      expect(getPriorityClass()).toBe('bg-gray-100 text-gray-800');
      expect(getPriorityClass(undefined)).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('🏷️ getPriorityLabel', () => {
    it('✅ should return correct labels for each priority', () => {
      expect(getPriorityLabel('high')).toBe('דחוף');
      expect(getPriorityLabel('medium')).toBe('רגיל');
      expect(getPriorityLabel('low')).toBe('נמוך');
    });

    it('✅ should return default label for undefined priority', () => {
      expect(getPriorityLabel()).toBe('לא מוגדר');
      expect(getPriorityLabel(undefined)).toBe('לא מוגדר');
    });
  });
}); 