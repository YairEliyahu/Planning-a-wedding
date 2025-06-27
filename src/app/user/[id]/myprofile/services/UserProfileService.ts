import { UserProfile, WalletInfo, BudgetAnalysis, ChecklistCategory } from '../types/profileTypes';

class UserProfileService {
  private baseUrl = '/api';

  async fetchUserProfile(userId: string): Promise<{ user: UserProfile }> {
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async fetchWeddingChecklist(userId: string): Promise<{ checklist: ChecklistCategory[] }> {
    const response = await fetch(`${this.baseUrl}/wedding-checklist/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wedding checklist: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async fetchWeddingPreferences(userId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/wedding-preferences/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch wedding preferences: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Helper method to calculate wallet info from checklist data
  calculateWalletInfo(checklist: ChecklistCategory[], _userProfile: UserProfile): WalletInfo {
    // חישוב סך כל ההוצאות מהצ'ק ליסט
    const totalExpenses = checklist.reduce((total: number, category: ChecklistCategory) => {
      return total + category.items.reduce((sum: number, item: any) => {
        return sum + (Number(item.budget) || 0);
      }, 0);
    }, 0);

    // חישוב ההכנסות הצפויות מהאורחים
    const venueItem = checklist[0]?.items[0];
    const guestCount = venueItem?.guestCount || 0;
    const averageGift = venueItem?.averageGift || 0;
    const expectedIncome = guestCount * averageGift;

    return {
      totalBudget: expectedIncome,
      spentBudget: totalExpenses,
      remainingBudget: expectedIncome - totalExpenses,
      lastTransactions: checklist.flatMap((category: ChecklistCategory) => 
        category.items.map((item: any) => ({
          itemName: item.name,
          amount: Number(item.budget) || 0,
          date: new Date().toISOString().split('T')[0]
        }))
      ).slice(0, 5)
    };
  }

  // Helper method to calculate budget analysis
  calculateBudgetAnalysis(checklist: ChecklistCategory[]): BudgetAnalysis {
    // חישוב סך כל ההוצאות מהצ'ק ליסט
    const totalExpenses = checklist.reduce((total: number, category: ChecklistCategory) => {
      return total + category.items.reduce((sum: number, item: any) => {
        return sum + (Number(item.budget) || 0);
      }, 0);
    }, 0);

    // חישוב ההכנסות הצפויות מהאורחים
    const venueItem = checklist[0]?.items[0];
    const guestCount = venueItem?.guestCount || 0;
    const averageGift = venueItem?.averageGift || 0;
    const expectedIncome = guestCount * averageGift;

    return {
      expectedIncome,
      estimatedExpenses: totalExpenses,
      categories: checklist.map((category: ChecklistCategory) => ({
        name: category.name,
        amount: category.items.reduce((sum: number, item: any) => sum + (Number(item.budget) || 0), 0)
      }))
    };
  }
}

export const userProfileService = new UserProfileService(); 