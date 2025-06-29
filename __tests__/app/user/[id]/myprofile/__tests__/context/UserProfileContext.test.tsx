import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfileProvider, useUserProfile } from '../../context/UserProfileContext';
import { userProfileService } from '../../services/UserProfileService';
import { mockUserProfile, mockApiResponses } from '../utils/mock-data';

jest.mock('../../services/UserProfileService');

const mockUserProfileService = userProfileService as jest.Mocked<typeof userProfileService>;

function createWrapper(userId = 'test-user-id') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider userId={userId}>
        {children}
      </UserProfileProvider>
    </QueryClientProvider>
  );
  
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

describe('UserProfileContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserProfileService.fetchUserProfile.mockResolvedValue(mockApiResponses.userProfile);
    mockUserProfileService.fetchWeddingChecklist.mockResolvedValue(mockApiResponses.checklist);
    mockUserProfileService.fetchWeddingPreferences.mockResolvedValue(mockApiResponses.preferences);
    mockUserProfileService.calculateWalletInfo.mockReturnValue({
      totalBudget: 50000,
      spentBudget: 135000,
      remainingBudget: -85000,
      lastTransactions: [],
    });
    mockUserProfileService.calculateBudgetAnalysis.mockReturnValue({
      expectedIncome: 50000,
      estimatedExpenses: 135000,
      categories: [],
    });
  });

  describe('useUserProfile hook', () => {
    it('should throw error when used outside provider', () => {
      try {
        renderHook(() => useUserProfile());
        throw new Error('Should have thrown error');
      } catch (error: any) {
        if (!error.message.includes('useUserProfile must be used within a UserProfileProvider')) {
          throw new Error('Wrong error message');
        }
      }
    });

    it('should provide initial context values', () => {
      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      if (result.current.profile !== null) throw new Error('Profile should be null initially');
      if (result.current.timeLeft.days !== 0) throw new Error('Time left days should be 0 initially');
      if (result.current.isProfileLoading !== true) throw new Error('Profile should be loading initially');
      if (typeof result.current.refetchProfile !== 'function') throw new Error('refetchProfile should be function');
      if (typeof result.current.updateProfile !== 'function') throw new Error('updateProfile should be function');
    });

    it('should load profile data successfully', async () => {
      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (result.current.isProfileLoading !== false) throw new Error('Profile should stop loading');
      });

      if (!result.current.profile) throw new Error('Profile data not loaded');
      if (result.current.profile.fullName !== mockUserProfile.fullName) {
        throw new Error('Profile data mismatch');
      }
      if (mockUserProfileService.fetchUserProfile.mock.calls.length === 0) {
        throw new Error('fetchUserProfile should have been called');
      }
    });

    it('should load checklist data successfully', async () => {
      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (result.current.isChecklistLoading !== false) throw new Error('Checklist should stop loading');
      });

      if (mockUserProfileService.fetchWeddingChecklist.mock.calls.length === 0) {
        throw new Error('fetchWeddingChecklist should have been called');
      }
      if (mockUserProfileService.calculateWalletInfo.mock.calls.length === 0) {
        throw new Error('calculateWalletInfo should have been called');
      }
    });

    it('should handle profile fetch error', async () => {
      const error = new Error('Profile fetch failed');
      mockUserProfileService.fetchUserProfile.mockRejectedValue(error);

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (!result.current.profileError) throw new Error('Profile error should be set');
      });

      if (result.current.profile !== null) throw new Error('Profile should remain null on error');
      if (result.current.isProfileLoading !== false) throw new Error('Loading should stop on error');
    });

    it('should handle checklist fetch error', async () => {
      const error = new Error('Checklist fetch failed');
      mockUserProfileService.fetchWeddingChecklist.mockRejectedValue(error);

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (!result.current.checklistError) throw new Error('Checklist error should be set');
      });

      if (result.current.isChecklistLoading !== false) throw new Error('Loading should stop on error');
    });

    it('should handle preferences fetch error', async () => {
      const error = new Error('Preferences fetch failed');
      mockUserProfileService.fetchWeddingPreferences.mockRejectedValue(error);

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (!result.current.preferencesError) throw new Error('Preferences error should be set');
      });

      if (result.current.isPreferencesLoading !== false) throw new Error('Loading should stop on error');
    });
  });

  describe('Wedding countdown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate time left for wedding', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
      
      const profileWithFutureWedding = {
        ...mockUserProfile,
        weddingDate: futureDate.toISOString(),
      };

      mockUserProfileService.fetchUserProfile.mockResolvedValue({
        user: profileWithFutureWedding,
      });

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (!result.current.profile) throw new Error('Profile should be loaded');
      });

      if (result.current.timeLeft.days <= 0) throw new Error('Time left should be positive');
    });

    it('should update countdown every second', async () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + 86400000); // 1 day from now

      const profileWithFutureWedding = {
        ...mockUserProfile,
        weddingDate: futureDate.toISOString(),
      };

      mockUserProfileService.fetchUserProfile.mockResolvedValue({
        user: profileWithFutureWedding,
      });

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (!result.current.profile) throw new Error('Profile should be loaded');
      });

      const initialSeconds = result.current.timeLeft.seconds;

      // Fast-forward time by 1 second
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        if (result.current.timeLeft.seconds === initialSeconds) throw new Error('Seconds should have changed');
      });
    });
  });

  describe('Profile updates', () => {
    it('should update profile successfully', async () => {
      mockUserProfileService.updateUserProfile.mockResolvedValue({
        ...mockUserProfile,
        fullName: 'Updated Name',
      });

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (result.current.isProfileLoading !== false) throw new Error('Profile should stop loading');
      });

      const updateData = { fullName: 'Updated Name' };
      await result.current.updateProfile(updateData);

      if (mockUserProfileService.updateUserProfile.mock.calls.length === 0) {
        throw new Error('updateUserProfile should have been called');
      }
      const [userId, data] = mockUserProfileService.updateUserProfile.mock.calls[0];
      if (userId !== 'test-user-id') throw new Error('Wrong user ID passed');
      if (data.fullName !== 'Updated Name') throw new Error('Wrong update data passed');
    });

    it('should handle profile update error', async () => {
      const error = new Error('Update failed');
      mockUserProfileService.updateUserProfile.mockRejectedValue(error);

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (result.current.isProfileLoading !== false) throw new Error('Profile should stop loading');
      });

      try {
        await result.current.updateProfile({ fullName: 'Test' });
        throw new Error('Update should have failed');
      } catch (error: any) {
        if (!error.message.includes('Update failed')) throw new Error('Wrong error thrown');
      }
    });
  });

  describe('Data refetching', () => {
    it('should refetch profile data', async () => {
      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (result.current.isProfileLoading !== false) throw new Error('Profile should stop loading');
      });

      mockUserProfileService.fetchUserProfile.mockClear();
      
      result.current.refetchProfile();

      await waitFor(() => {
        if (mockUserProfileService.fetchUserProfile.mock.calls.length === 0) {
          throw new Error('fetchUserProfile should have been called on refetch');
        }
      });
    });

    it('should refetch checklist data', async () => {
      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (result.current.isChecklistLoading !== false) throw new Error('Checklist should stop loading');
      });

      mockUserProfileService.fetchWeddingChecklist.mockClear();
      
      result.current.refetchChecklist();

      await waitFor(() => {
        if (mockUserProfileService.fetchWeddingChecklist.mock.calls.length === 0) {
          throw new Error('fetchWeddingChecklist should have been called on refetch');
        }
      });
    });

    it('should refetch all data', async () => {
      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (result.current.isProfileLoading !== false) throw new Error('Profile should stop loading');
      });

      mockUserProfileService.fetchUserProfile.mockClear();
      mockUserProfileService.fetchWeddingChecklist.mockClear();
      
      result.current.refetchAll();

      await waitFor(() => {
        if (mockUserProfileService.fetchUserProfile.mock.calls.length === 0) {
          throw new Error('fetchUserProfile should have been called on refetchAll');
        }
        if (mockUserProfileService.fetchWeddingChecklist.mock.calls.length === 0) {
          throw new Error('fetchWeddingChecklist should have been called on refetchAll');
        }
      });
    });
  });

  describe('Provider with different userId', () => {
    it('should not fetch data when userId is empty', () => {
      renderHook(() => useUserProfile(), {
        wrapper: createWrapper(''),
      });

      if (mockUserProfileService.fetchUserProfile.mock.calls.length > 0) {
        throw new Error('fetchUserProfile should not be called with empty userId');
      }
    });

    it('should fetch data with different userId', async () => {
      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper('different-user-id'),
      });

      await waitFor(() => {
        if (result.current.isProfileLoading !== false) throw new Error('Profile should stop loading');
      });

      const profileCalls = mockUserProfileService.fetchUserProfile.mock.calls;
      const checklistCalls = mockUserProfileService.fetchWeddingChecklist.mock.calls;
      const preferencesCalls = mockUserProfileService.fetchWeddingPreferences.mock.calls;

      if (profileCalls.length === 0 || profileCalls[0][0] !== 'different-user-id') {
        throw new Error('fetchUserProfile should be called with different-user-id');
      }
      if (checklistCalls.length === 0 || checklistCalls[0][0] !== 'different-user-id') {
        throw new Error('fetchWeddingChecklist should be called with different-user-id');
      }
      if (preferencesCalls.length === 0 || preferencesCalls[0][0] !== 'different-user-id') {
        throw new Error('fetchWeddingPreferences should be called with different-user-id');
      }
    });
  });
}); 