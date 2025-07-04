'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSync } from '@/contexts/SyncContext';
import { userProfileService } from '../services/UserProfileService';
import { 
  UserProfile, 
  UserProfileContextType, 
  TimeLeft, 
  WalletInfo, 
  BudgetAnalysis,
  ChecklistCategory 
} from '../types/profileTypes';
import { useAuth } from '@/contexts/AuthContext';

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
  userId: string;
}

export function UserProfileProvider({ children, userId }: UserProfileProviderProps) {
  const queryClient = useQueryClient();
  const { emitUpdate } = useSync();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    totalBudget: 0,
    spentBudget: 0,
    remainingBudget: 0,
    lastTransactions: []
  });
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis>({
    expectedIncome: 0,
    estimatedExpenses: 0,
    categories: []
  });

  // Use sharedEventId if exists, otherwise fallback to userId
  const effectiveId = user?.sharedEventId || userId;

  // React Query for user profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userProfile', effectiveId],
    queryFn: () => userProfileService.fetchUserProfile(effectiveId),
    enabled: !!effectiveId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query for wedding checklist
  const {
    data: checklistData,
    isLoading: isChecklistLoading,
    error: checklistError,
    refetch: refetchChecklist,
  } = useQuery({
    queryKey: ['weddingChecklist', effectiveId],
    queryFn: () => userProfileService.fetchWeddingChecklist(effectiveId),
    enabled: !!effectiveId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query for wedding preferences
  const {
    isLoading: isPreferencesLoading,
    error: preferencesError,
  } = useQuery({
    queryKey: ['weddingPreferences', effectiveId],
    queryFn: () => userProfileService.fetchWeddingPreferences(effectiveId),
    enabled: !!effectiveId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => 
      userProfileService.updateUserProfile(effectiveId, data),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', effectiveId] });
      
      // Send update to partner
      emitUpdate('preferences', 'update', { 
        profile: updatedProfile 
      });
    },
  });

  const profile = profileData?.user || null;

  // Wedding countdown effect
  useEffect(() => {
    if (!profile?.weddingDate) return;

    const calculateTimeLeft = () => {
      const weddingTime = new Date(profile.weddingDate).getTime();
      const now = new Date().getTime();
      const difference = weddingTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [profile?.weddingDate]);

  // Process checklist data when it changes
  useEffect(() => {
    if (!checklistData?.checklist || !profile) return;

    const checklist = checklistData.checklist as ChecklistCategory[];
    
    // Calculate wallet info
    const newWalletInfo = userProfileService.calculateWalletInfo(checklist, profile);
    setWalletInfo(newWalletInfo);

    // Calculate budget analysis
    const newBudgetAnalysis = userProfileService.calculateBudgetAnalysis(checklist);
    setBudgetAnalysis(newBudgetAnalysis);
  }, [checklistData, profile]);

  // Refetch all queries
  const refetchAll = () => {
    refetchProfile();
    refetchChecklist();
    queryClient.invalidateQueries({ queryKey: ['weddingPreferences', effectiveId] });
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const contextValue: UserProfileContextType = {
    // Profile data
    profile,
    timeLeft,
    walletInfo,
    budgetAnalysis,
    
    // Loading states
    isProfileLoading,
    isChecklistLoading,
    isPreferencesLoading,
    
    // Error states
    profileError: profileError as Error | null,
    checklistError: checklistError as Error | null,
    preferencesError: preferencesError as Error | null,
    
    // Actions
    refetchProfile,
    refetchChecklist,
    refetchAll,
    updateProfile,
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile(): UserProfileContextType {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
} 