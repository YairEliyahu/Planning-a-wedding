'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSync } from '@/contexts/SyncContext';
import { 
  ChecklistContextValue, 
  FilterType, 
  SortType,
  ChecklistItem
} from '../types';
import { useChecklist, useUpdateChecklist, useResetChecklist, useClearCache } from '../hooks/useChecklistQuery';
import { ChecklistService } from '../services/checklistService';
import { generateChartData } from '../utils/checklistUtils';

const ChecklistContext = createContext<ChecklistContextValue | undefined>(undefined);

interface ChecklistProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function ChecklistProvider({ children, userId }: ChecklistProviderProps) {
  const { user } = useAuth();
  const { emitUpdate } = useSync();
  
  // Use sharedEventId if exists, otherwise fallback to userId
  const effectiveId = user?.sharedEventId || userId;

  // React Query hooks
  const { data: categories = [], isLoading, error: queryError } = useChecklist(effectiveId, !!effectiveId);
  
  const handleSaveSuccess = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };
  
  const updateChecklistMutation = useUpdateChecklist(effectiveId, handleSaveSuccess);
  const resetChecklistMutation = useResetChecklist(effectiveId);
  const { clearUser, invalidateUser } = useClearCache();

  // Local state
  const [filters, setFilters] = useState<{ filter: FilterType; sortBy: SortType }>({
    filter: 'all',
    sortBy: 'priority'
  });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // מחושבים מהנתונים
  const summary = useMemo(() => ChecklistService.calculateSummary(categories), [categories]);
  const chartData = useMemo(() => generateChartData(categories, summary.expectedIncome), [categories, summary.expectedIncome]);

  // רענון אוטומטי עבור משתמשים מחוברים
  useEffect(() => {
    if (user && user.connectedUserId) {
      console.log(`User has connected account ${user.connectedUserId}, setting up auto-refresh for checklist`);
      let autoRefreshInterval: NodeJS.Timeout;

      const initialDelay = setTimeout(() => {
        console.log('Initial refresh of checklist for connected accounts');
        clearUser(effectiveId);
        invalidateUser(effectiveId);

        autoRefreshInterval = setInterval(() => {
          console.log('Auto-refreshing checklist for connected accounts...');
          clearUser(effectiveId);
          invalidateUser(effectiveId);
        }, 30000);
      }, 5000);

      return () => {
        clearTimeout(initialDelay);
        clearInterval(autoRefreshInterval);
      };
    }
  }, [user, effectiveId, clearUser, invalidateUser]);

  // טיפול בשגיאות
  useEffect(() => {
    if (queryError) {
      setError('אירעה שגיאה בטעינת הנתונים');
    } else {
      setError('');
    }
  }, [queryError]);

  // פונקציות עדכון
  const toggleItem = async (itemId: string) => {
    const updatedCategories = ChecklistService.updateChecklistItem(
      categories,
      itemId,
      { isCompleted: !categories.find(cat => 
          cat.items.find(item => item.id === itemId)
        )?.items.find(item => item.id === itemId)?.isCompleted 
      }
    );
    updateChecklistMutation.mutate(updatedCategories);
    
    // Send update to partner
    const item = categories.find(cat => 
      cat.items.find(item => item.id === itemId)
    )?.items.find(item => item.id === itemId);
    if (item) {
      emitUpdate('checklist', 'update', { 
        itemId, 
        isCompleted: !item.isCompleted,
        item 
      });
    }
  };

  const addItem = async (categoryName: string) => {
    if (!newItemName.trim()) return;

    const newItem: Omit<ChecklistItem, 'id'> = {
      category: categoryName,
      subCategory: 'כללי',
      name: newItemName,
      isCompleted: false,
      budget: '',
      priority: 'medium'
    };

    const updatedCategories = ChecklistService.addItemToCategory(
      categories,
      categoryName,
      newItem
    );

    updateChecklistMutation.mutate(updatedCategories);
    
    // Send update to partner
    emitUpdate('checklist', 'add', { 
      categoryName, 
      item: newItem 
    });
    
    setNewItemName('');
    setIsAddingItem(false);
    setSelectedCategory('');
  };

  const toggleCategory = (categoryName: string) => {
    const updatedCategories = ChecklistService.toggleCategoryExpansion(
      categories,
      categoryName
    );
    updateChecklistMutation.mutate(updatedCategories);
  };

  const updateBudget = async (itemId: string, value: string) => {
    const updatedCategories = ChecklistService.updateChecklistItem(
      categories,
      itemId,
      { budget: value }
    );
    updateChecklistMutation.mutate(updatedCategories);
  };

  const updateGuestCount = async (itemId: string, value: string) => {
    const guestCount = value === '' ? 0 : parseInt(value);
    const item = categories.find(cat => 
      cat.items.find(item => item.id === itemId)
    )?.items.find(item => item.id === itemId);
    
    if (item) {
      const costPerPerson = item.costPerPerson || 0;
      const totalVenueCost = guestCount * costPerPerson;
      
      const updatedCategories = ChecklistService.updateChecklistItem(
        categories,
        itemId,
        { 
          guestCount,
          budget: totalVenueCost.toString()
        }
      );
      updateChecklistMutation.mutate(updatedCategories);
    }
  };

  const updateAverageGift = async (itemId: string, value: string) => {
    const averageGift = value === '' ? 0 : parseInt(value);
    const updatedCategories = ChecklistService.updateChecklistItem(
      categories,
      itemId,
      { averageGift }
    );
    updateChecklistMutation.mutate(updatedCategories);
  };

  const updateCostPerPerson = async (itemId: string, value: string) => {
    const costPerPerson = value === '' ? 0 : parseInt(value);
    const item = categories.find(cat => 
      cat.items.find(item => item.id === itemId)
    )?.items.find(item => item.id === itemId);
    
    if (item) {
      const guestCount = item.guestCount || 0;
      const totalVenueCost = guestCount * costPerPerson;
      
      const updatedCategories = ChecklistService.updateChecklistItem(
        categories,
        itemId,
        { 
          costPerPerson,
          budget: totalVenueCost.toString()
        }
      );
      updateChecklistMutation.mutate(updatedCategories);
    }
  };

  const resetChecklist = async () => {
    resetChecklistMutation.mutate();
    setShowResetConfirm(false);
  };

  const setFilter = (filter: FilterType) => {
    setFilters(prev => ({ ...prev, filter }));
  };

  const setSortBy = (sortBy: SortType) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const value: ChecklistContextValue = {
    // Data
    categories,
    filters,
    expectedIncome: summary.expectedIncome,
    venueTotalCost: summary.venueTotalCost,
    summary,
    chartData,
    
    // UI State
    isLoading: isLoading, // רק טעינה ראשונית
    isSaving: updateChecklistMutation.isPending || resetChecklistMutation.isPending, // שמירה ברקע
    showSaveSuccess, // הודעת הצלחה עדינה
    error,
    isAddingItem,
    selectedCategory,
    newItemName,
    showResetConfirm,
    
    // Actions
    toggleItem,
    addItem,
    toggleCategory,
    updateBudget,
    updateGuestCount,
    updateAverageGift,
    updateCostPerPerson,
    resetChecklist,
    setFilter,
    setSortBy,
    setIsAddingItem,
    setSelectedCategory,
    setNewItemName,
    setShowResetConfirm,
  };

  return (
    <ChecklistContext.Provider value={value}>
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklistContext(): ChecklistContextValue {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error('useChecklistContext must be used within a ChecklistProvider');
  }
  return context;
} 