import { Category, ChecklistResponse } from '../types';
import { defaultCategories } from '../constants/defaultData';

export class ChecklistService {
  private static dataCache = new Map<string, any>();

  // פונקציה שמחזירה נתונים מהקאש או מבצעת בקשה חדשה
  private static async fetchWithCache(url: string, cacheKey: string): Promise<any> {
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey);
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      this.dataCache.set(cacheKey, data);
    }
    
    return data;
  }

  // טעינת הצ'קליסט
  static async fetchChecklist(userId: string): Promise<Category[]> {
    try {
      const cacheKey = `checklist-${userId}`;
      const data: ChecklistResponse = await this.fetchWithCache(
        `/api/wedding-checklist/${userId}`, 
        cacheKey
      );
      
      if (data.checklist && Array.isArray(data.checklist)) {
        return data.checklist;
      } else {
        return defaultCategories;
      }
    } catch (error) {
      console.error('Failed to fetch checklist:', error);
      return defaultCategories;
    }
  }

  // שמירת הצ'קליסט
  static async saveChecklist(userId: string, categories: Category[]): Promise<boolean> {
    try {
      const response = await fetch(`/api/wedding-checklist/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories }),
      });

      if (response.ok) {
        const cacheKey = `checklist-${userId}`;
        this.dataCache.set(cacheKey, { checklist: categories });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to save checklist:', error);
      return false;
    }
  }

  // ניקוי המטמון
  static clearCache(): void {
    this.dataCache.clear();
  }

  // ניקוי המטמון עבור משתמש ספציפי
  static clearUserCache(userId: string): void {
    const cacheKey = `checklist-${userId}`;
    this.dataCache.delete(cacheKey);
  }

  // עדכון פריט בצ'קליסט
  static updateChecklistItem(
    categories: Category[], 
    itemId: string, 
    updates: Partial<Category['items'][0]>
  ): Category[] {
    return categories.map(category => ({
      ...category,
      items: category.items.map(item => 
        item.id === itemId 
          ? { ...item, ...updates }
          : item
      )
    }));
  }

  // הוספת פריט חדש לקטגוריה
  static addItemToCategory(
    categories: Category[],
    categoryName: string,
    newItem: Omit<Category['items'][0], 'id'>
  ): Category[] {
    const itemWithId = {
      ...newItem,
      id: Date.now().toString()
    };

    return categories.map(category => 
      category.name === categoryName
        ? { ...category, items: [...category.items, itemWithId] }
        : category
    );
  }

  // החלפת מצב קטגוריה (מורחב/מכווץ)
  static toggleCategoryExpansion(
    categories: Category[],
    categoryName: string
  ): Category[] {
    return categories.map(category => 
      category.name === categoryName
        ? { ...category, isExpanded: !category.isExpanded }
        : category
    );
  }

  // איפוס כל הנתונים
  static resetAllData(categories: Category[]): Category[] {
    return categories.map(category => ({
      ...category,
      items: category.items.map(item => ({
        ...item,
        isCompleted: false,
        budget: '',
        guestCount: 0,
        averageGift: 0,
        costPerPerson: 0
      }))
    }));
  }

  // חישוב סיכומים ונתונים
  static calculateSummary(categories: Category[]) {
    if (!Array.isArray(categories)) {
      return {
        totalBudget: 0,
        progress: 0,
        expectedIncome: 0,
        venueTotalCost: 0,
        totalExpenses: 0,
        balance: 0,
        isProfit: false
      };
    }

    // חישוב תקציב כולל
    const totalBudget = categories.reduce((total, category) => {
      if (!Array.isArray(category.items)) return total;
      return total + category.items.reduce((sum, item) => 
        sum + (Number(item.budget) || 0), 0
      );
    }, 0);

    // חישוב אחוז התקדמות
    let totalItems = 0;
    let completedItems = 0;

    for (const category of categories) {
      if (Array.isArray(category.items)) {
        totalItems += category.items.length;
        completedItems += category.items.filter(item => item.isCompleted).length;
      }
    }

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // חישוב נתוני האולם
    const venueItem = categories[0]?.items[0];
    const guestCount = venueItem?.guestCount || 0;
    const averageGift = venueItem?.averageGift || 0;
    const costPerPerson = venueItem?.costPerPerson || 0;
    
    const expectedIncome = guestCount * averageGift;
    const venueTotalCost = guestCount * costPerPerson;
    const balance = expectedIncome - totalBudget;
    const isProfit = balance >= 0;

    return {
      totalBudget,
      progress,
      expectedIncome,
      venueTotalCost,
      totalExpenses: totalBudget,
      balance,
      isProfit
    };
  }
} 