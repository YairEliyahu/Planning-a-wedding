'use client';

import { useUserStats, useCustomStats } from '../hooks/useStats';

export default function UserStats() {
  const { data: stats, isLoading, error } = useUserStats();
  const customStats = useCustomStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-800">שגיאה בטעינת הסטטיסטיקות</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'סך המשתמשים',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'bg-blue-500',
      subtitle: `${customStats.activeUserPercentage.toFixed(1)}% פעילים`
    },
    {
      title: 'משתמשים פעילים',
      value: stats?.activeUsers || 0,
      icon: '✅',
      color: 'bg-green-500',
      subtitle: 'מתוך סך המשתמשים'
    },
    {
      title: 'פרופילים מושלמים',
      value: stats?.completedProfiles || 0,
      icon: '📋',
      color: 'bg-purple-500',
      subtitle: `${customStats.completionRate.toFixed(1)}% השלמה`
    },
    {
      title: 'זוגות מחוברים',
      value: stats?.connectedCouples || 0,
      icon: '💑',
      color: 'bg-pink-500',
      subtitle: `${customStats.coupleConnectionRate.toFixed(1)}% חיבור`
    },
    {
      title: 'משתמשים חדשים החודש',
      value: stats?.newUsersThisMonth || 0,
      icon: '📈',
      color: 'bg-orange-500',
      subtitle: `${customStats.growthPercentage > 0 ? '+' : ''}${customStats.growthPercentage.toFixed(1)}% צמיחה`
    },
    {
      title: 'פעילות אחרונה',
      value: stats?.recentActivity || 0,
      icon: '⚡',
      color: 'bg-yellow-500',
      subtitle: 'ב-24 השעות האחרונות'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center">
            <div className={`${stat.color} rounded-full p-3 text-white text-2xl mr-4 shadow-lg`}>
              {stat.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              )}
            </div>
          </div>
          
          {/* אינדיקטור לביצועים */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">עדכון אחרון</span>
              <span className="text-gray-400">
                {new Date().toLocaleTimeString('he-IL')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 