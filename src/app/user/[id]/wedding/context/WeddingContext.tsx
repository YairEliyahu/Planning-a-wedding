'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useWeddingData, 
  useSaveWeddingData, 
  useAutoRefreshWeddingData,
  useRefreshWeddingData 
} from '../hooks/useWeddingData';
import { 
  WeddingContextValue, 
  WeddingPreferences 
} from '../types/wedding.types';

interface WeddingProviderProps {
  children: React.ReactNode;
  userId: string;
}

const WeddingContext = createContext<WeddingContextValue | undefined>(undefined);

export function WeddingProvider({ children, userId }: WeddingProviderProps) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [localPreferences, setLocalPreferences] = useState<WeddingPreferences>({
    venueType: '',
    timeOfDay: '',
    locationPreference: '',
    guestsCount: '',
  });
  const [localError, setLocalError] = useState('');

  // React Query hooks
  const { 
    data: weddingData, 
    isLoading: isLoadingData, 
    error: dataError 
  } = useWeddingData(userId);

  const { 
    mutate: saveWeddingData, 
    isPending: isSaving 
  } = useSaveWeddingData(userId);

  const { refreshWeddingData } = useRefreshWeddingData();

  // Auto-refresh for connected users
  const isConnectedUser = !!(user?.connectedUserId);
  useAutoRefreshWeddingData(userId, isConnectedUser);

  // Auth check effect
  React.useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthReady) {
        console.log('Auth not ready yet');
        return;
      }

      console.log('Auth state:', { isAuthReady, user: user?._id });

      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      if (user._id !== userId) {
        console.log('User ID mismatch:', { userId: user._id, paramsId: userId });
        router.push(`/user/${user._id}/wedding`);
        return;
      }
    };

    checkAuth();
  }, [isAuthReady, user, userId, router]);

  // Update local preferences when data is loaded
  React.useEffect(() => {
    if (weddingData?.preferences) {
      setLocalPreferences(weddingData.preferences);
    }
  }, [weddingData]);

  // Update local error when there's a data error
  React.useEffect(() => {
    if (dataError) {
      setLocalError('אירעה שגיאה בטעינת העדפות החתונה');
    } else {
      setLocalError('');
    }
  }, [dataError]);

  // Clear local error when it exists
  React.useEffect(() => {
    if (localError) {
      setLocalError('');
    }
  }, [localError]);

  const updatePreferences = useCallback((newPreferences: Partial<WeddingPreferences>) => {
    setLocalPreferences(prev => ({
      ...prev,
      ...newPreferences,
    }));
  }, []);

  const savePreferences = useCallback(async () => {
    try {
      setLocalError('');
      
      return new Promise<void>((resolve, reject) => {
        saveWeddingData(localPreferences, {
          onSuccess: () => {
            console.log('Wedding preferences saved successfully');
            resolve();
          },
          onError: (error) => {
            console.error('Failed to save wedding preferences:', error);
            setLocalError('שגיאה בשמירת העדפות החתונה');
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setLocalError('שגיאה בשמירת העדפות החתונה');
      throw error;
    }
  }, [localPreferences, saveWeddingData]);

  const refreshData = useCallback(async () => {
    try {
      setLocalError('');
      await refreshWeddingData(userId);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setLocalError('אירעה שגיאה בעת רענון הנתונים');
      throw error;
    }
  }, [refreshWeddingData, userId]);

  const clearError = useCallback(() => {
    setLocalError('');
  }, []);

  const contextValue: WeddingContextValue = {
    // State
    profile: weddingData?.profile || null,
    preferences: localPreferences,
    savedPreferences: weddingData?.preferences || null,
    isLoading: isLoadingData || isSaving,
    error: localError,
    
    // Actions
    updatePreferences,
    savePreferences,
    refreshData,
    clearError,
  };

  return (
    <WeddingContext.Provider value={contextValue}>
      {children}
    </WeddingContext.Provider>
  );
}

// Custom hook to use the wedding context
export function useWeddingContext(): WeddingContextValue {
  const context = useContext(WeddingContext);
  
  if (context === undefined) {
    throw new Error('useWeddingContext must be used within a WeddingProvider');
  }
  
  return context;
}

// Export the context for advanced usage
export { WeddingContext };
export default WeddingProvider; 