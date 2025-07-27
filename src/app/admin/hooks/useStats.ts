import { useQuery } from '@tanstack/react-query';
import { UserStats } from '../types/admin';
import { ActivityStats, GrowthStats } from '../db/interfaces/IUserRepository';

// API Service functions
const statsAPI = {
  getUserStats: async (): Promise<UserStats> => {
    const response = await fetch('/api/admin/stats?type=user-stats');
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    return response.json();
  },

  getActivityStats: async (days: number): Promise<ActivityStats> => {
    const response = await fetch(`/api/admin/stats?type=activity-stats&days=${days}`);
    if (!response.ok) {
      throw new Error('Failed to fetch activity stats');
    }
    return response.json();
  },

  getGrowthStats: async (): Promise<GrowthStats> => {
    const response = await fetch('/api/admin/stats?type=growth-stats');
    if (!response.ok) {
      throw new Error('Failed to fetch growth stats');
    }
    return response.json();
  },
};

// Query keys לניהול cache מיטבי
export const STATS_QUERY_KEYS = {
  all: ['admin', 'stats'] as const,
  userStats: () => [...STATS_QUERY_KEYS.all, 'user-stats'] as const,
  activityStats: (days: number) => [...STATS_QUERY_KEYS.all, 'activity', { days }] as const,
  growthStats: () => [...STATS_QUERY_KEYS.all, 'growth'] as const,
};

// Hook עבור קבלת סטטיסטיקות משתמשים כלליות
export const useUserStats = () => {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.userStats(),
    queryFn: statsAPI.getUserStats,
    staleTime: 1000 * 60 * 5, // 5 דקות
    gcTime: 1000 * 60 * 15, // 15 דקות
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook עבור קבלת סטטיסטיקות פעילות
export const useActivityStats = (days: number = 7) => {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.activityStats(days),
    queryFn: () => statsAPI.getActivityStats(days),
    staleTime: 1000 * 60 * 10, // 10 דקות (פחות frequent updates)
    gcTime: 1000 * 60 * 30, // 30 דקות
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: days > 0 && days <= 365, // validation
  });
};

// Hook עבור קבלת סטטיסטיקות צמיחה
export const useGrowthStats = () => {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.growthStats(),
    queryFn: statsAPI.getGrowthStats,
    staleTime: 1000 * 60 * 15, // 15 דקות (עדכון פחות תכוף)
    gcTime: 1000 * 60 * 60, // שעה
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook מרוכב לכל הסטטיסטיקות
export const useAllStats = (activityDays: number = 7) => {
  const userStats = useUserStats();
  const activityStats = useActivityStats(activityDays);
  const growthStats = useGrowthStats();

  return {
    userStats: {
      data: userStats.data,
      isLoading: userStats.isLoading,
      error: userStats.error,
      refetch: userStats.refetch,
    },
    activityStats: {
      data: activityStats.data,
      isLoading: activityStats.isLoading,
      error: activityStats.error,
      refetch: activityStats.refetch,
    },
    growthStats: {
      data: growthStats.data,
      isLoading: growthStats.isLoading,
      error: growthStats.error,
      refetch: growthStats.refetch,
    },
    // מצב כללי
    isLoading: userStats.isLoading || activityStats.isLoading || growthStats.isLoading,
    hasError: userStats.error || activityStats.error || growthStats.error,
    refetchAll: () => {
      userStats.refetch();
      activityStats.refetch();
      growthStats.refetch();
    },
  };
};

// Hook לקבלת סטטיסטיקות מותאמות אישית
export const useCustomStats = () => {
  const { data: userStats } = useUserStats();
  const { data: growthStats } = useGrowthStats();

  // חישובים נוספים מבוססי הנתונים הקיימים
  const computedStats = {
    growthPercentage: growthStats ? growthStats.growthRate : 0,
    completionRate: userStats ? 
      userStats.totalUsers > 0 ? (userStats.completedProfiles / userStats.totalUsers) * 100 : 0 
      : 0,
    activeUserPercentage: userStats ? 
      userStats.totalUsers > 0 ? (userStats.activeUsers / userStats.totalUsers) * 100 : 0 
      : 0,
    coupleConnectionRate: userStats ? 
      userStats.totalUsers > 0 ? (userStats.connectedCouples / userStats.totalUsers) * 100 : 0 
      : 0,
  };

  return {
    ...computedStats,
    isReady: !!userStats && !!growthStats,
  };
};

// Types exports
export type { UserStats, ActivityStats, GrowthStats };
