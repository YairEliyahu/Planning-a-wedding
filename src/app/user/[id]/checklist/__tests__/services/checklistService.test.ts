import { ChecklistService } from '../../services/checklistService';
import { Category, ChecklistItem } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('🛠️ ChecklistService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ChecklistService.clearCache();
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    ChecklistService.clearCache();
  });

  describe('📥 fetchChecklist', () => {
    it('✅ should fetch checklist successfully', async () => {
      const mockResponse = {
        checklist: [
          {
            name: 'מקום האירוע',
            items: [
              {
                id: '1',
                name: 'בחירת אולם',
                isCompleted: false,
                budget: '50000',
                category: 'מקום האירוע',
                subCategory: 'כללי',
                priority: 'high'
              }
            ],
            isExpanded: true
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await ChecklistService.fetchChecklist('user123');

      expect(fetch).toHaveBeenCalledWith('/api/wedding-checklist/user123');
      expect(result).toEqual(mockResponse.checklist);
    });

    it('✅ should return default categories when API fails', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await ChecklistService.fetchChecklist('user123');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('✅ should use cache for subsequent calls', async () => {
      const mockResponse = {
        checklist: [{ name: 'Test', items: [], isExpanded: true }]
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call
      await ChecklistService.fetchChecklist('user123');
      // Second call
      await ChecklistService.fetchChecklist('user123');

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('✅ should return default categories when response has no checklist', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await ChecklistService.fetchChecklist('user123');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('💾 saveChecklist', () => {
    it('✅ should save checklist successfully', async () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          items: [],
          isExpanded: true
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await ChecklistService.saveChecklist('user123', categories);

      expect(fetch).toHaveBeenCalledWith('/api/wedding-checklist/user123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories }),
      });
      expect(result).toBe(true);
    });

    it('✅ should return false when save fails', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const result = await ChecklistService.saveChecklist('user123', []);

      expect(result).toBe(false);
    });

    it('✅ should handle network error during save', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await ChecklistService.saveChecklist('user123', []);

      expect(result).toBe(false);
    });

    it('✅ should update cache after successful save', async () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          items: [],
          isExpanded: true
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await ChecklistService.saveChecklist('user123', categories);

      // Verify cache was updated by checking if fetch is not called again
      (fetch as jest.Mock).mockClear();
      await ChecklistService.fetchChecklist('user123');
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('🔄 updateChecklistItem', () => {
    it('✅ should update item correctly', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: [
            {
              id: '1',
              name: 'בחירת אולם',
              isCompleted: false,
              budget: '50000',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high'
            }
          ]
        }
      ];

      const updated = ChecklistService.updateChecklistItem(categories, '1', {
        isCompleted: true,
        budget: '60000'
      });

      expect(updated[0].items[0].isCompleted).toBe(true);
      expect(updated[0].items[0].budget).toBe('60000');
      expect(updated[0].items[0].name).toBe('בחירת אולם'); // לא השתנה
    });

    it('✅ should not update if item not found', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: [
            {
              id: '1',
              name: 'בחירת אולם',
              isCompleted: false,
              budget: '50000',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high'
            }
          ]
        }
      ];

      const updated = ChecklistService.updateChecklistItem(categories, 'nonexistent', {
        isCompleted: true
      });

      expect(updated[0].items[0].isCompleted).toBe(false); // לא השתנה
    });

    it('✅ should handle multiple categories', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: [
            {
              id: '1',
              name: 'בחירת אולם',
              isCompleted: false,
              budget: '50000',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high'
            }
          ]
        },
        {
          name: 'קייטרינג',
          isExpanded: true,
          items: [
            {
              id: '2',
              name: 'בחירת תפריט',
              isCompleted: false,
              budget: '30000',
              category: 'קייטרינג',
              subCategory: 'כללי',
              priority: 'medium'
            }
          ]
        }
      ];

      const updated = ChecklistService.updateChecklistItem(categories, '2', {
        isCompleted: true
      });

      expect(updated[0].items[0].isCompleted).toBe(false); // לא השתנה
      expect(updated[1].items[0].isCompleted).toBe(true); // השתנה
    });
  });

  describe('➕ addItemToCategory', () => {
    it('✅ should add item to category', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: []
        }
      ];

      const newItem: Omit<ChecklistItem, 'id'> = {
        name: 'פריט חדש',
        category: 'מקום האירוע',
        subCategory: 'כללי',
        isCompleted: false,
        budget: '',
        priority: 'medium'
      };

      const updated = ChecklistService.addItemToCategory(categories, 'מקום האירוע', newItem);

      expect(updated[0].items).toHaveLength(1);
      expect(updated[0].items[0].name).toBe('פריט חדש');
      expect(updated[0].items[0].id).toBeDefined();
      expect(updated[0].items[0].id).toBeTruthy();
    });

    it('✅ should not add to non-existent category', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: []
        }
      ];

      const newItem: Omit<ChecklistItem, 'id'> = {
        name: 'פריט חדש',
        category: 'קייטרינג',
        subCategory: 'כללי',
        isCompleted: false,
        budget: '',
        priority: 'medium'
      };

      const updated = ChecklistService.addItemToCategory(categories, 'קייטרינג', newItem);

      expect(updated[0].items).toHaveLength(0); // לא נוסף
    });

    it('✅ should add to existing items', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: [
            {
              id: '1',
              name: 'פריט קיים',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              isCompleted: false,
              budget: '',
              priority: 'high'
            }
          ]
        }
      ];

      const newItem: Omit<ChecklistItem, 'id'> = {
        name: 'פריט חדש',
        category: 'מקום האירוע',
        subCategory: 'כללי',
        isCompleted: false,
        budget: '',
        priority: 'medium'
      };

      const updated = ChecklistService.addItemToCategory(categories, 'מקום האירוע', newItem);

      expect(updated[0].items).toHaveLength(2);
      expect(updated[0].items[1].name).toBe('פריט חדש');
    });
  });

  describe('🔽🔼 toggleCategoryExpansion', () => {
    it('✅ should toggle category expansion', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: []
        }
      ];

      const updated = ChecklistService.toggleCategoryExpansion(categories, 'מקום האירוע');

      expect(updated[0].isExpanded).toBe(false);
    });

    it('✅ should not affect other categories', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: []
        },
        {
          name: 'קייטרינג',
          isExpanded: false,
          items: []
        }
      ];

      const updated = ChecklistService.toggleCategoryExpansion(categories, 'מקום האירוע');

      expect(updated[0].isExpanded).toBe(false);
      expect(updated[1].isExpanded).toBe(false); // לא השתנה
    });

    it('✅ should handle non-existent category', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: []
        }
      ];

      const updated = ChecklistService.toggleCategoryExpansion(categories, 'לא קיים');

      expect(updated[0].isExpanded).toBe(true); // לא השתנה
    });
  });

  describe('📊 calculateSummary', () => {
    it('✅ should calculate summary correctly', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: [
            {
              id: '1',
              name: 'אולם',
              isCompleted: true,
              budget: '50000',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high',
              guestCount: 100,
              averageGift: 500,
              costPerPerson: 400
            },
            {
              id: '2',
              name: 'קישוטים',
              isCompleted: false,
              budget: '10000',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'medium'
            }
          ]
        }
      ];

      const summary = ChecklistService.calculateSummary(categories);

      expect(summary.totalBudget).toBe(60000);
      expect(summary.progress).toBe(50); // 1 out of 2 completed
      expect(summary.expectedIncome).toBe(50000); // 100 * 500
      expect(summary.venueTotalCost).toBe(40000); // 100 * 400
      expect(summary.balance).toBe(-10000); // 50000 - 60000
      expect(summary.isProfit).toBe(false);
    });

    it('✅ should handle empty categories', () => {
      const summary = ChecklistService.calculateSummary([]);

      expect(summary.totalBudget).toBe(0);
      expect(summary.progress).toBe(0);
      expect(summary.expectedIncome).toBe(0);
      expect(summary.venueTotalCost).toBe(0);
      expect(summary.balance).toBe(0);
      expect(summary.isProfit).toBe(false);
    });

    it('✅ should handle invalid data gracefully', () => {
      const invalidCategories = null as any;

      const summary = ChecklistService.calculateSummary(invalidCategories);

      expect(summary.totalBudget).toBe(0);
      expect(summary.progress).toBe(0);
    });

    it('✅ should handle missing venue item', () => {
      const categories: Category[] = [
        {
          name: 'קייטרינג',
          isExpanded: true,
          items: [
            {
              id: '1',
              name: 'תפריט',
              isCompleted: true,
              budget: '30000',
              category: 'קייטרינג',
              subCategory: 'כללי',
              priority: 'high'
            }
          ]
        }
      ];

      const summary = ChecklistService.calculateSummary(categories);

      expect(summary.expectedIncome).toBe(0);
      expect(summary.venueTotalCost).toBe(0);
      expect(summary.totalBudget).toBe(30000);
    });
  });

  describe('🔄 resetAllData', () => {
    it('✅ should reset all data correctly', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
          items: [
            {
              id: '1',
              name: 'אולם',
              isCompleted: true,
              budget: '50000',
              category: 'מקום האירוע',
              subCategory: 'כללי',
              priority: 'high',
              guestCount: 100,
              averageGift: 500,
              costPerPerson: 400
            }
          ]
        }
      ];

      const reset = ChecklistService.resetAllData(categories);

      expect(reset[0].items[0].isCompleted).toBe(false);
      expect(reset[0].items[0].budget).toBe('');
      expect(reset[0].items[0].guestCount).toBe(0);
      expect(reset[0].items[0].averageGift).toBe(0);
      expect(reset[0].items[0].costPerPerson).toBe(0);
      expect(reset[0].items[0].name).toBe('אולם'); // לא השתנה
      expect(reset[0].items[0].id).toBe('1'); // לא השתנה
      expect(reset[0].items[0].priority).toBe('high'); // לא השתנה
    });

    it('✅ should handle empty categories', () => {
      const reset = ChecklistService.resetAllData([]);

      expect(reset).toEqual([]);
    });

    it('✅ should reset multiple categories', () => {
      const categories: Category[] = [
        {
          name: 'מקום האירוע',
          isExpanded: true,
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
          ]
        },
        {
          name: 'קייטרינג',
          isExpanded: true,
          items: [
            {
              id: '2',
              name: 'תפריט',
              isCompleted: true,
              budget: '30000',
              category: 'קייטרינג',
              subCategory: 'כללי',
              priority: 'medium'
            }
          ]
        }
      ];

      const reset = ChecklistService.resetAllData(categories);

      expect(reset[0].items[0].isCompleted).toBe(false);
      expect(reset[1].items[0].isCompleted).toBe(false);
      expect(reset[0].items[0].budget).toBe('');
      expect(reset[1].items[0].budget).toBe('');
    });
  });

  describe('🗂️ Cache Management', () => {
    it('✅ should clear all cache', () => {
      // הגדרת cache
      ChecklistService['dataCache'].set('test', 'data');
      
      ChecklistService.clearCache();
      
      expect(ChecklistService['dataCache'].size).toBe(0);
    });

    it('✅ should clear user specific cache', () => {
      ChecklistService['dataCache'].set('checklist-user123', 'data');
      ChecklistService['dataCache'].set('checklist-user456', 'data');
      
      ChecklistService.clearUserCache('user123');
      
      expect(ChecklistService['dataCache'].has('checklist-user123')).toBe(false);
      expect(ChecklistService['dataCache'].has('checklist-user456')).toBe(true);
    });

    it('✅ should handle clearing non-existent cache', () => {
      ChecklistService.clearUserCache('nonexistent');
      
      expect(ChecklistService['dataCache'].size).toBe(0);
    });
  });
}); 