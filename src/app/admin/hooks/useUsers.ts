import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminUser } from '../types/admin';
import { UserFilters } from '../db/interfaces/IUserRepository';

// API Service functions
const usersAPI = {
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await fetch('/api/admin/users-advanced');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  getUsersByFilter: async (filters: UserFilters): Promise<AdminUser[]> => {
    const params = new URLSearchParams();
    params.append('action', 'filter');
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    
    const response = await fetch(`/api/admin/users-advanced?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch filtered users');
    }
    return response.json();
  },

  searchUsers: async (query: string): Promise<AdminUser[]> => {
    const response = await fetch(`/api/admin/users-advanced?action=search&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    return response.json();
  },

  getUserById: async (userId: string): Promise<AdminUser | null> => {
    const response = await fetch(`/api/admin/users-advanced?action=get-by-id&id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<boolean> => {
    const response = await fetch('/api/admin/users-advanced?action=update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isActive }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user status');
    }
    
    const result = await response.json();
    return result.success;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    const response = await fetch(`/api/admin/users-advanced?id=${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    const result = await response.json();
    return result.success;
  },

  bulkDeleteUsers: async (userIds: string[]): Promise<number> => {
    const response = await fetch('/api/admin/users-advanced?action=bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to bulk delete users');
    }
    
    const result = await response.json();
    return result.deletedCount;
  },

  getUserCount: async (): Promise<number> => {
    const response = await fetch('/api/admin/users-advanced?action=count');
    if (!response.ok) {
      throw new Error('Failed to get user count');
    }
    const result = await response.json();
    return result.count;
  },

  getActiveUserCount: async (): Promise<number> => {
    const response = await fetch('/api/admin/users-advanced?action=active-count');
    if (!response.ok) {
      throw new Error('Failed to get active user count');
    }
    const result = await response.json();
    return result.activeCount;
  },
};

// Query keys לניהול cache מיטבי
export const USER_QUERY_KEYS = {
  all: ['admin', 'users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: UserFilters) => [...USER_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
  search: (query: string) => [...USER_QUERY_KEYS.all, 'search', query] as const,
  stats: () => [...USER_QUERY_KEYS.all, 'stats'] as const,
};

// Hook עבור קבלת כל המשתמשים
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(filters),
    queryFn: () => filters ? usersAPI.getUsersByFilter(filters) : usersAPI.getAllUsers(),
    staleTime: 1000 * 60 * 5, // 5 דקות
    gcTime: 1000 * 60 * 10, // 10 דקות
    refetchOnWindowFocus: false,
  });
};

// Hook עבור חיפוש משתמשים
export const useUserSearch = (searchQuery: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.search(searchQuery),
    queryFn: () => usersAPI.searchUsers(searchQuery),
    enabled: enabled && searchQuery.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 דקות
    gcTime: 1000 * 60 * 5, // 5 דקות
  });
};

// Hook עבור קבלת משתמש יחיד
export const useUser = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(userId),
    queryFn: () => usersAPI.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 דקות
    gcTime: 1000 * 60 * 10, // 10 דקות
  });
};

// Hook עבור עדכון סטטוס משתמש
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      usersAPI.updateUserStatus(userId, isActive),
    onSuccess: (_, { userId }) => {
      // Optimistic updates
      queryClient.setQueryData(
        USER_QUERY_KEYS.detail(userId),
        (old: AdminUser | null) => old ? { ...old, isActive: !old.isActive } : null
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() });
    },
    onError: (_, { userId }) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

// Hook עבור מחיקת משתמש
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersAPI.deleteUser(userId),
    onSuccess: (_, userId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });
      
      // Update lists by removing the deleted user
      queryClient.setQueriesData(
        { queryKey: USER_QUERY_KEYS.lists() },
        (old: AdminUser[] | undefined) => old?.filter(user => user._id !== userId)
      );

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() });
    },
    onError: () => {
      // Refetch all data on error
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
  });
};

// Hook עבור מחיקה מרוכזת
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => usersAPI.bulkDeleteUsers(userIds),
    onSuccess: (deletedCount, userIds) => {
      // Remove from cache
      userIds.forEach(userId => {
        queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });
      });
      
      // Update lists by removing deleted users
      queryClient.setQueriesData(
        { queryKey: USER_QUERY_KEYS.lists() },
        (old: AdminUser[] | undefined) => old?.filter(user => !userIds.includes(user._id))
      );

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() });
    },
    onError: () => {
      // Refetch all data on error
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
  });
};

// Hook מרוכב לפעולות משתמשים
export const useUserActions = () => {
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();
  const bulkDelete = useBulkDeleteUsers();

  return {
    updateStatus: {
      mutate: updateStatus.mutate,
      mutateAsync: updateStatus.mutateAsync,
      isPending: updateStatus.isPending,
      error: updateStatus.error,
    },
    delete: {
      mutate: deleteUser.mutate,
      mutateAsync: deleteUser.mutateAsync,
      isPending: deleteUser.isPending,
      error: deleteUser.error,
    },
    bulkDelete: {
      mutate: bulkDelete.mutate,
      mutateAsync: bulkDelete.mutateAsync,
      isPending: bulkDelete.isPending,
      error: bulkDelete.error,
    },
  };
};
