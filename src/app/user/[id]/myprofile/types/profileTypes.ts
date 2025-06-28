export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  weddingDate: string;
  partnerName: string;
  partnerPhone: string;
  expectedGuests: string;
  weddingLocation: string;
  budget: string;
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  isProfileComplete: boolean;
  authProvider: string;
  gender: 'male' | 'female';
  partnerGender: 'male' | 'female';
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface WalletInfo {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  lastTransactions: {
    itemName: string;
    amount: number;
    date: string;
  }[];
}

export interface BudgetAnalysis {
  expectedIncome: number;
  estimatedExpenses: number;
  categories: {
    name: string;
    amount: number;
  }[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  budget: string;
  guestCount?: number;
  averageGift?: number;
  costPerPerson?: number;
}

export interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

export interface UserProfileContextType {
  // Profile data
  profile: UserProfile | null;
  timeLeft: TimeLeft;
  walletInfo: WalletInfo;
  budgetAnalysis: BudgetAnalysis;
  
  // Loading states
  isProfileLoading: boolean;
  isChecklistLoading: boolean;
  isPreferencesLoading: boolean;
  
  // Error states
  profileError: Error | null;
  checklistError: Error | null;
  preferencesError: Error | null;
  
  // Actions
  refetchProfile: () => void;
  refetchChecklist: () => void;
  refetchAll: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export interface ProfilePageParams {
  id: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top';
      labels: {
        font: {
          size: number;
        };
      };
    };
    title: {
      display: boolean;
      text: string;
      font: {
        size: number;
      };
    };
  };
  scales: {
    x: {
      ticks: {
        font: {
          size: number;
        };
      };
    };
    y: {
      ticks: {
        font: {
          size: number;
        };
      };
    };
  };
} 