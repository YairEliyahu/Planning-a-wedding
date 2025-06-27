'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useOptimizedMultiFetch } from '@/hooks/useOptimizedFetch';
import { PerformanceMonitor } from '@/utils/performance';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const LazyChartComponent = dynamic(() => import('@/components/LazyChartComponent'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">
    <LoadingSpinner size="md" text="טוען תרשים..." />
  </div>
});

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  weddingDate: string;
  partnerName: string;
  partnerPhone: string;
  expectedGuests: string;
  weddingLocation: string;
  budget: string;
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  isProfileComplete: boolean;
  authProvider: string;
  gender: 'male' | 'female';
  partnerGender: 'male' | 'female';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface WalletInfo {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  lastTransactions: {
    itemName: string;
    amount: number;
    date: string;
  }[];
}

interface BudgetAnalysis {
  expectedIncome: number;
  estimatedExpenses: number;
  categories: {
    name: string;
    amount: number;
  }[];
}

interface ChecklistItem {
  id: string;
  name: string;
  budget: string;
  guestCount?: number;
  averageGift?: number;
  costPerPerson?: number;
}

interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    totalBudget: 0,
    spentBudget: 0,
    remainingBudget: 0,
    lastTransactions: []
  });
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis>({
    expectedIncome: 0,
    estimatedExpenses: 0,
    categories: []
  });

  // Use optimized multi-fetch for all data
  const apiUrls = [
    `/api/user/${params.id}`,
    `/api/wedding-checklist/${params.id}`,
    `/api/wedding-preferences/${params.id}`
  ];

  const { data, loading, errors, refetchAll } = useOptimizedMultiFetch(
    apiUrls,
    {
      cacheKey: `user-profile-${params.id}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutes cache
      retries: 2,
      timeout: 8000
    }
  );

  const [profileData, checklistData] = data;

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user._id !== params.id) {
      router.push(`/user/${user._id}`);
      return;
    }
  }, [isAuthReady, user, params.id, router]);

  useEffect(() => {
    if (!profileData) return;
    
    const userData = profileData as any;
    if (!userData.user) return;

    PerformanceMonitor.startTimer('profile-processing');

    // Check if profile is complete
    if (userData.user.isProfileComplete === false) {
      console.log('Profile not complete, redirecting to complete-profile');
      router.push('/complete-profile');
      return;
    }

    console.log('Profile is complete, processing user data');
    setProfile(userData.user);
    
    if (userData.user.weddingDate) {
      startWeddingCountdown(userData.user.weddingDate);
    }

    PerformanceMonitor.endTimer('profile-processing');
  }, [profileData, router]);

  useEffect(() => {
    if (!checklistData) return;
    
    const checklistInfo = checklistData as any;
    if (!checklistInfo.checklist) return;

    PerformanceMonitor.startTimer('checklist-processing');
    processChecklistData(checklistInfo);
    PerformanceMonitor.endTimer('checklist-processing');
  }, [checklistData]);

  const processChecklistData = (data: { checklist?: ChecklistCategory[] }) => {
    if (!data?.checklist) return;

    // חישוב סך כל ההוצאות מהצ'ק ליסט
    const totalExpenses = data.checklist.reduce((total: number, category: ChecklistCategory) => {
      return total + category.items.reduce((sum: number, item: ChecklistItem) => {
        return sum + (Number(item.budget) || 0);
      }, 0);
    }, 0);

    // חישוב ההכנסות הצפויות מהאורחים
    const venueItem = data.checklist[0]?.items[0];
    const guestCount = venueItem?.guestCount || 0;
    const averageGift = venueItem?.averageGift || 0;
    const expectedIncome = guestCount * averageGift;

    // עדכון הניתוח התקציבי
    setBudgetAnalysis({
      expectedIncome,
      estimatedExpenses: totalExpenses,
      categories: data.checklist.map((category: ChecklistCategory) => ({
        name: category.name,
        amount: category.items.reduce((sum: number, item: ChecklistItem) => sum + (Number(item.budget) || 0), 0)
      }))
    });

    // עדכון פרטי הארנק
    setWalletInfo({
      totalBudget: expectedIncome,
      spentBudget: totalExpenses,
      remainingBudget: expectedIncome - totalExpenses,
      lastTransactions: data.checklist.flatMap((category: ChecklistCategory) => 
        category.items.map((item: ChecklistItem) => ({
          itemName: item.name,
          amount: Number(item.budget) || 0,
          date: new Date().toISOString().split('T')[0]
        }))
      ).slice(0, 5)
    });
  };

  const startWeddingCountdown = (weddingDate: string) => {
    const calculateTimeLeft = () => {
      const weddingTime = new Date(weddingDate).getTime();
      const now = new Date().getTime();
      const difference = weddingTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  };

  // Loading states
  if (!isAuthReady || loading) {
    return (
      <LoadingSpinner 
        text="טוען נתוני פרופיל..."
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  // Error handling
  if (errors.some(error => error !== null)) {
    const hasProfileError = errors[0]; // Profile error is most critical
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-500 text-xl font-bold mb-4">שגיאה בטעינת הנתונים</h2>
          <p className="text-gray-700 mb-6">
            {hasProfileError ? 'שגיאה בטעינת פרופיל המשתמש' : 'שגיאה בטעינת נתוני החתונה'}
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => refetchAll()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              נסה שנית
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">לא נמצא פרופיל</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <Navbar />
      
      {/* התראה להגדרת סיסמה למשתמשי Google */}
      {profile.authProvider === 'google' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 mx-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="mr-3 flex-grow">
              <h3 className="text-lg font-medium text-blue-800">
                הגדר סיסמה לחשבון שלך
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                כרגע אתה יכול להתחבר רק עם Google. הגדר סיסמה כדי להתחבר גם בלי Google
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => router.push(`/set-password?email=${encodeURIComponent(profile.email)}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                הגדר סיסמה
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* כרטיס ספירה לאחור */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 mb-8 text-center relative overflow-hidden">
          {/* רקע דקורטיבי */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-100/30 via-rose-100/20 to-pink-100/30"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-6 px-2">
              היי {profile.fullName} ו{profile.partnerName} 💕
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-6 text-gray-700 font-medium">היום הגדול מתקרב!</p>
          
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 max-w-2xl mx-auto">
              <div className="text-center bg-gradient-to-br from-pink-100 to-rose-100 p-4 sm:p-6 rounded-2xl shadow-lg border border-pink-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">{timeLeft.days}</span>
                <span className="text-sm sm:text-base text-gray-700 font-medium">ימים</span>
              </div>
              <div className="text-center bg-gradient-to-br from-rose-100 to-pink-100 p-4 sm:p-6 rounded-2xl shadow-lg border border-rose-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">{timeLeft.hours}</span>
                <span className="text-sm sm:text-base text-gray-700 font-medium">שעות</span>
              </div>
              <div className="text-center bg-gradient-to-br from-pink-200 to-rose-200 p-4 sm:p-6 rounded-2xl shadow-lg border border-pink-300/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-700 to-rose-600 bg-clip-text text-transparent">{timeLeft.minutes}</span>
                <span className="text-sm sm:text-base text-gray-700 font-medium">דקות</span>
              </div>
              <div className="text-center bg-gradient-to-br from-rose-200 to-pink-200 p-4 sm:p-6 rounded-2xl shadow-lg border border-rose-300/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">{timeLeft.seconds}</span>
                <span className="text-sm sm:text-base text-gray-700 font-medium">שניות</span>
              </div>
            </div>
          
            <p className="text-base sm:text-lg text-gray-600 px-2 font-medium">
              תאריך החתונה: {new Date(profile.weddingDate).toLocaleDateString('he-IL')}
            </p>
          </div>
        </div>

        {/* Grid עם קטעים של ניתוח תקציב והארנק */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* ניתוח תקציב */}
          {budgetAnalysis.categories.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 xl:col-span-2 relative overflow-hidden">
              {/* רקע דקורטיבי */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full"></div>
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                  📊 ניתוח תקציב
                </h3>
                <LazyChartComponent
                  data={{
                    labels: budgetAnalysis.categories.map(cat => cat.name),
                    datasets: [{
                      label: 'הוצאות לפי קטגוריה',
                      data: budgetAnalysis.categories.map(cat => cat.amount),
                      backgroundColor: 'rgba(245, 158, 11, 0.5)',
                      borderColor: 'rgba(245, 158, 11, 1)',
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          font: {
                            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'התפלגות הוצאות לפי קטגוריה',
                        font: {
                          size: typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 14
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          font: {
                            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      },
                      y: {
                        ticks: {
                          font: {
                            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
          
          {/* הארנק */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 relative overflow-hidden">
            {/* רקע דקורטיבי */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-200/40 to-transparent rounded-full"></div>
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent flex items-center gap-2">
                💳 הארנק שלי
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">תקציב כולל</p>
                      <p className="text-xl sm:text-2xl font-bold text-pink-700">₪{walletInfo.totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-2xl">💰</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">הוצאות</p>
                      <p className="text-xl sm:text-2xl font-bold text-rose-700">₪{walletInfo.spentBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-2xl">💸</div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl border border-pink-300/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">נותר</p>
                      <p className="text-xl sm:text-2xl font-bold text-pink-800">₪{walletInfo.remainingBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-2xl">💎</div>
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-pink-100 rounded-full h-4 mb-4 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-pink-400 via-rose-500 to-pink-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min((walletInfo.spentBudget / walletInfo.totalBudget) * 100, 100)}%` }}
                ></div>
              </div>
            
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  {Math.round((walletInfo.spentBudget / walletInfo.totalBudget) * 100)}% מהתקציב נוצל
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* הוצאות אחרונות */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">הוצאות אחרונות</h3>
          {walletInfo.lastTransactions.length > 0 ? (
            <div className="responsive-table">
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">שם הפריט</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">סכום</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-700">תאריך</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletInfo.lastTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm">{transaction.itemName}</td>
                        <td className="py-3 px-4 font-medium text-sm">₪{transaction.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{new Date(transaction.date).toLocaleDateString('he-IL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* מבט מובייל */}
              <div className="sm:hidden space-y-3">
                {walletInfo.lastTransactions.map((transaction, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{transaction.itemName}</h4>
                      <span className="font-bold text-sm text-purple-600">₪{transaction.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('he-IL')}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💰</div>
              <p className="text-gray-500">אין הוצאות אחרונות</p>
            </div>
          )}
        </div>
        
        {/* פרטי הפרופיל */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">פרטי פרופיל</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-base sm:text-lg font-medium mb-3 text-purple-700 border-b border-purple-200 pb-2">פרטים אישיים</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">שם מלא:</span>
                    <span className="text-sm sm:text-base">{profile.fullName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">אימייל:</span>
                    <span className="text-sm sm:text-base break-all">{profile.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">טלפון:</span>
                    <span className="text-sm sm:text-base">{profile.phoneNumber}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-medium mb-3 text-pink-700 border-b border-pink-200 pb-2">פרטי בן/בת הזוג</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">שם:</span>
                    <span className="text-sm sm:text-base">{profile.partnerName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">טלפון:</span>
                    <span className="text-sm sm:text-base">{profile.partnerPhone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-base sm:text-lg font-medium mb-3 text-blue-700 border-b border-blue-200 pb-2">פרטי החתונה</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-24">תאריך:</span>
                    <span className="text-sm sm:text-base">{new Date(profile.weddingDate).toLocaleDateString('he-IL')}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-24">מיקום:</span>
                    <span className="text-sm sm:text-base">{profile.weddingLocation}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-24">אורחים:</span>
                    <span className="text-sm sm:text-base">{profile.expectedGuests}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-24">תקציב:</span>
                    <span className="text-sm sm:text-base font-semibold">₪{parseInt(profile.budget).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-medium mb-3 text-green-700 border-b border-green-200 pb-2">שירותים נדרשים</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {profile.preferences.venue && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> אולם אירועים</div>}
                  {profile.preferences.catering && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> קייטרינג</div>}
                  {profile.preferences.photography && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> צילום</div>}
                  {profile.preferences.music && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> מוזיקה</div>}
                  {profile.preferences.design && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> עיצוב</div>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push(`/user/${profile._id}/edit`)}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base font-medium"
            >
              ערוך פרופיל
            </button>
            {profile.authProvider === 'google' && (
              <button
                onClick={() => router.push(`/set-password?email=${encodeURIComponent(profile.email)}`)}
                className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base font-medium"
              >
                הגדר סיסמה
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}