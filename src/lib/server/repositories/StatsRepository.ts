import User from '@/models/User';
import { UserStats } from '@/app/admin/types/admin';
import { IStatsRepository, ActivityStats, GrowthStats } from '../interfaces/IUserRepository';
import connectToDatabase from '@/utils/dbConnect';

export class StatsRepository implements IStatsRepository {
  private static instance: StatsRepository;

  // Singleton pattern - יעיל לביצועים
  public static getInstance(): StatsRepository {
    if (!StatsRepository.instance) {
      StatsRepository.instance = new StatsRepository();
    }
    return StatsRepository.instance;
  }

  async getUserStats(): Promise<UserStats> {
    await connectToDatabase();
    
    // שימוש באגרגציה מקבילה לביצועים מיטביים
    const [
      totalUsers,
      activeUsers,
      completedProfiles,
      connectedCouples,
      newUsersThisMonth,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isProfileComplete: true }),
      User.countDocuments({ 
        $and: [
          { connectedUserId: { $ne: null } },
          { partnerInviteAccepted: true }
        ]
      }),
      this.getNewUsersThisMonth(),
      this.getRecentActivityCount()
    ]);

    return {
      totalUsers,
      activeUsers,
      completedProfiles,
      connectedCouples,
      newUsersThisMonth,
      recentActivity
    };
  }

  async getActivityStats(days: number): Promise<ActivityStats> {
    await connectToDatabase();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // אגרגציה מיטבית עם pipeline יעיל
    const [loginResults, registrationResults, recentActivity] = await Promise.all([
      User.aggregate([
        {
          $match: {
            lastLogin: { 
              $gte: startDate,
              $exists: true,
              $ne: null 
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$lastLogin'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      this.getRecentActivityCount()
    ]);

    // טרנספורמציה לפורמט הנדרש
    const dailyLogins: Record<string, number> = {};
    const dailyRegistrations: Record<string, number> = {};

    loginResults.forEach((item: any) => {
      dailyLogins[item._id] = item.count;
    });

    registrationResults.forEach((item: any) => {
      dailyRegistrations[item._id] = item.count;
    });

    return {
      dailyLogins,
      dailyRegistrations,
      recentActivity
    };
  }

  async getGrowthStats(): Promise<GrowthStats> {
    await connectToDatabase();
    
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: startOfThisMonth }
      }),
      User.countDocuments({
        createdAt: {
          $gte: startOfLastMonth,
          $lt: startOfThisMonth
        }
      })
    ]);

    // חישוב שיעור הצמיחה
    const growthRate = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : newUsersThisMonth > 0 ? 100 : 0;

    return {
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      growthRate: Math.round(growthRate * 100) / 100 // עיגול לשתי ספרות אחרי הנקודה
    };
  }

  // Helper methods פרטיות לשימוש חוזר
  private async getNewUsersThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    return await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
  }

  private async getRecentActivityCount(): Promise<number> {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    return await User.countDocuments({
      lastLogin: { $gte: last24Hours }
    });
  }
}
