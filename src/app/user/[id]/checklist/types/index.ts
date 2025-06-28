export interface ChecklistItem {
  id: string;
  category: string;
  subCategory: string;
  name: string;
  isCompleted: boolean;
  budget: string;
  notes?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  guestCount?: number;
  averageGift?: number;
  costPerPerson?: number;
}

export interface Category {
  name: string;
  items: ChecklistItem[];
  isExpanded: boolean;
  icon?: string;
  description?: string;
}

export interface ChecklistData {
  checklist: Category[];
}

export interface ChecklistResponse {
  checklist?: Category[];
  message?: string;
}

export interface ChecklistSummary {
  totalBudget: number;
  progress: number;
  expectedIncome: number;
  venueTotalCost: number;
  totalExpenses: number;
  balance: number;
  isProfit: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export type FilterType = 'all' | 'completed' | 'pending';
export type SortType = 'priority' | 'name' | 'budget';

export interface ChecklistFilters {
  filter: FilterType;
  sortBy: SortType;
}

export interface ChecklistContextValue {
  // Data
  categories: Category[];
  filters: ChecklistFilters;
  expectedIncome: number;
  venueTotalCost: number;
  summary: ChecklistSummary;
  chartData: ChartData;
  
  // UI State
  isLoading: boolean;
  error: string;
  isAddingItem: boolean;
  selectedCategory: string;
  newItemName: string;
  showResetConfirm: boolean;
  
  // Actions
  toggleItem: (itemId: string) => void;
  addItem: (categoryName: string) => void;
  toggleCategory: (categoryName: string) => void;
  updateBudget: (itemId: string, value: string) => void;
  updateGuestCount: (itemId: string, value: string) => void;
  updateAverageGift: (itemId: string, value: string) => void;
  updateCostPerPerson: (itemId: string, value: string) => void;
  resetChecklist: () => void;
  setFilter: (filter: FilterType) => void;
  setSortBy: (sortBy: SortType) => void;
  setIsAddingItem: (value: boolean) => void;
  setSelectedCategory: (category: string) => void;
  setNewItemName: (name: string) => void;
  setShowResetConfirm: (show: boolean) => void;
}

export interface ChecklistQueryKey {
  queryKey: ['checklist', string];
} 