import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Category } from '../types';
import { ChecklistService } from '../services/checklistService';

// Hook לטעינת הצ'קליסט
export const useChecklist = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['checklist', userId],
    queryFn: () => ChecklistService.fetchChecklist(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: (failureCount, error: any) => {
      // אל תנסה שוב אם זה 404
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
  });
};

// Hook לשמירת הצ'קליסט
export const useUpdateChecklist = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categories: Category[]) => 
      ChecklistService.saveChecklist(userId, categories),
    onMutate: async (newCategories) => {
      // ביטול בקשות רקע כדי למנוע דריסה
      await queryClient.cancelQueries({ queryKey: ['checklist', userId] });

      // שמירת הנתונים הקודמים לשחזור במקרה של שגיאה
      const previousCategories = queryClient.getQueryData(['checklist', userId]);

      // עדכון אופטימיסטי
      queryClient.setQueryData(['checklist', userId], newCategories);

      // החזרת קונטקסט לשחזור
      return { previousCategories };
    },
    onError: (err, newCategories, context) => {
      // שחזור הנתונים הקודמים במקרה של שגיאה
      if (context?.previousCategories) {
        queryClient.setQueryData(['checklist', userId], context.previousCategories);
      }
      console.error('Failed to update checklist:', err);
    },
    onSettled: () => {
      // תמיד בצע refetch אחרי mutation
      queryClient.invalidateQueries({ queryKey: ['checklist', userId] });
    },
  });
};

// Hook לאיפוס הצ'קליסט
export const useResetChecklist = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const currentData = queryClient.getQueryData(['checklist', userId]) as Category[];
      if (!currentData) {
        throw new Error('No data to reset');
      }
      
      const resetData = ChecklistService.resetAllData(currentData);
      const success = await ChecklistService.saveChecklist(userId, resetData);
      
      if (!success) {
        throw new Error('Failed to reset checklist');
      }
      
      return resetData;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['checklist', userId] });
      const previousCategories = queryClient.getQueryData(['checklist', userId]);
      return { previousCategories };
    },
    onError: (err, variables, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['checklist', userId], context.previousCategories);
      }
      console.error('Failed to reset checklist:', err);
    },
    onSuccess: (resetData) => {
      queryClient.setQueryData(['checklist', userId], resetData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', userId] });
    },
  });
};

// Hook לניקוי מטמון
export const useClearCache = () => {
  const queryClient = useQueryClient();

  return {
    clearAll: () => {
      ChecklistService.clearCache();
      queryClient.clear();
    },
    clearUser: (userId: string) => {
      ChecklistService.clearUserCache(userId);
      queryClient.removeQueries({ queryKey: ['checklist', userId] });
    },
    invalidateUser: (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['checklist', userId] });
    }
  };
}; 