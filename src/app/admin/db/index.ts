// Import first, then export
import { UserRepository } from './repositories/UserRepository';
import { StatsRepository } from './repositories/StatsRepository';
import { UserFilters } from './interfaces/IUserRepository';

// Main exports - Facade pattern for clean interface
export { UserRepository, StatsRepository };

// Interface exports for type safety
export type { 
  IUserRepository, 
  IStatsRepository, 
  UserFilters, 
  ActivityStats, 
  GrowthStats 
} from './interfaces/IUserRepository';

// Factory pattern לייצור instances
export class RepositoryFactory {
  private static userRepository: UserRepository | null = null;
  private static statsRepository: StatsRepository | null = null;

  // Single Responsibility - יצירת UserRepository
  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = UserRepository.getInstance();
    }
    return this.userRepository;
  }

  // Single Responsibility - יצירת StatsRepository  
  static getStatsRepository(): StatsRepository {
    if (!this.statsRepository) {
      this.statsRepository = StatsRepository.getInstance();
    }
    return this.statsRepository;
  }

  // Utility לאיפוס cache במקרה הצורך
  static resetInstances(): void {
    this.userRepository = null;
    this.statsRepository = null;
  }
}

// Aggregator class שמאגדת פעולות נפוצות
export class AdminDataAggregator {
  private userRepo: UserRepository;
  private statsRepo: StatsRepository;

  constructor() {
    this.userRepo = RepositoryFactory.getUserRepository();
    this.statsRepo = RepositoryFactory.getStatsRepository();
  }

  // פעולה מרוכבת - קבלת overview מלא
  async getAdminOverview() {
    try {
      const [userStats, growthStats, userCount] = await Promise.all([
        this.statsRepo.getUserStats(),
        this.statsRepo.getGrowthStats(),
        this.userRepo.getUserCount()
      ]);

      return {
        stats: userStats,
        growth: growthStats,
        totalUsers: userCount,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      throw new Error('Failed to fetch admin overview');
    }
  }

  // פעולה מרוכבת - חיפוש מתקדם עם סטטיסטיקות
  async getAdvancedSearch(query: string, filters?: UserFilters) {
    try {
      const [searchResults, filteredResults] = await Promise.all([
        this.userRepo.searchUsers(query),
        filters ? this.userRepo.getUsersByFilter(filters) : Promise.resolve([])
      ]);

      // איחוד תוצאות ללא כפילויות
      const combinedResults = filters ? 
        searchResults.filter((user) => 
          filteredResults.some((filtered) => filtered._id === user._id)
        ) : searchResults;

      return {
        results: combinedResults,
        count: combinedResults.length,
        searchQuery: query,
        appliedFilters: filters || null
      };
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw new Error('Advanced search failed');
    }
  }
}

// Export default instance של Aggregator לשימוש קל
export const adminDataAggregator = new AdminDataAggregator();
