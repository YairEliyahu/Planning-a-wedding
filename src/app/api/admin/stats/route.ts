import { NextRequest, NextResponse } from 'next/server';
import { StatsRepository } from '@/lib/server/repositories/StatsRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const days = searchParams.get('days');

    const statsRepo = StatsRepository.getInstance();

    switch (type) {
      case 'user-stats': {
        const userStats = await statsRepo.getUserStats();
        return NextResponse.json(userStats);
      }

      case 'activity-stats': {
        const activityDays = days ? parseInt(days) : 7;
        const activityStats = await statsRepo.getActivityStats(activityDays);
        return NextResponse.json(activityStats);
      }

      case 'growth-stats': {
        const growthStats = await statsRepo.getGrowthStats();
        return NextResponse.json(growthStats);
      }

      default: {
        // Default: return user stats
        const defaultStats = await statsRepo.getUserStats();
        return NextResponse.json(defaultStats);
      }
    }
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 