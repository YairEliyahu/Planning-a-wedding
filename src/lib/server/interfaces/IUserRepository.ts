import { AdminUser, UserStats } from '@/app/admin/types/admin';

export interface IUserRepository {
  // Single Responsibility - ניהול משתמשים בלבד
  getAllUsers(): Promise<AdminUser[]>;
  getUserById(id: string): Promise<AdminUser | null>;
  getUsersByFilter(filters: UserFilters): Promise<AdminUser[]>;
  searchUsers(query: string): Promise<AdminUser[]>;
  
  // פעולות עדכון
  updateUserStatus(id: string, isActive: boolean): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
  bulkDeleteUsers(ids: string[]): Promise<number>;
  
  // סטטיסטיקות בסיסיות
  getUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
}

export interface IStatsRepository {
  // Single Responsibility - סטטיסטיקות בלבד  
  getUserStats(): Promise<UserStats>;
  getActivityStats(days: number): Promise<ActivityStats>;
  getGrowthStats(): Promise<GrowthStats>;
}

export interface UserFilters {
  role?: 'user' | 'admin';
  isActive?: boolean;
  emailVerified?: boolean;
  authProvider?: 'google' | 'email' | 'hybrid';
  isProfileComplete?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ActivityStats {
  dailyLogins: Record<string, number>;
  dailyRegistrations: Record<string, number>;
  recentActivity: number;
}

export interface GrowthStats {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  growthRate: number;
} 
