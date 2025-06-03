'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import LoadingSpinner from '../../components/LoadingSpinner';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// קאש לנתונים - מונע בקשות חוזרות
const dataCache = new Map();

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

interface Transaction {
  itemName: string;
  amount: number;
  date: string;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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

  // פונקציה שמחזירה נתונים מהקאש או מבצעת בקשה חדשה
  const fetchWithCache = async (url: string, cacheKey: string) => {
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey);
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      dataCache.set(cacheKey, data);
    }
    
    return data;
  };

  useEffect(() => {
    // להמנע מבדיקות מיותרות אם הנתונים כבר נטענו
    if (profile && !isLoading) return;

    const checkAuth = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!user) {
        router.push('/login');
        return;
      }

      if (user._id !== params.id) {
        router.push(`/user/${user._id}`);
        return;
      }

      await loadUserData();
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router, isLoading, profile]);

  // פונקציה המאגדת את כל בקשות הנתונים
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // בקשות מקבילות עם Promise.all
      const [profileData, checklistData] = await Promise.all([
        fetchUserProfile(),
        fetchChecklistData(),
        fetchWeddingPreferences()
      ]);

      if (!profileData?.user?.isProfileComplete) {
        router.push('/complete-profile');
        return;
      }

      setProfile(profileData.user);
      processChecklistData(checklistData);
    } catch (err) {
      setError('אירעה שגיאה בטעינת הנתונים');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChecklistData = async () => {
    try {
      const cacheKey = `checklist-${params.id}`;
      const data = await fetchWithCache(`/api/wedding-checklist/${params.id}`, cacheKey);
      return data;
    } catch (error) {
      return null;
    }
  };

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

    // עדכון נתוני הארנק
    setWalletInfo({
      totalBudget: expectedIncome,
      spentBudget: totalExpenses,
      remainingBudget: expectedIncome - totalExpenses,
      lastTransactions: data.checklist.flatMap((category: ChecklistCategory) => 
        category.items
          .filter((item: ChecklistItem) => item.budget && Number(item.budget) > 0)
          .map((item: ChecklistItem) => ({
            itemName: item.name,
            amount: Number(item.budget),
            date: new Date().toISOString()
          }))
      ).sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    });
  };

  const fetchWeddingPreferences = async () => {
    try {
      const cacheKey = `preferences-${params.id}`;
      return await fetchWithCache(`/api/wedding-preferences/${params.id}`, cacheKey);
    } catch (error) {
      return null;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const cacheKey = `user-${params.id}`;
      const data = await fetchWithCache(`/api/user/${params.id}`, cacheKey);
      
      if (!data.user) {
        throw new Error('לא נמצא משתמש');
      }

      // חישוב הזמן שנותר עד החתונה
      if (data.user.weddingDate) {
        startWeddingCountdown(data.user.weddingDate);
      }

      return data;
    } catch (err) {
      setError('Failed to load profile');
      return null;
    }
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

  // רכיב טעינה שמשתמש בLoadingSpinner
  if (!isAuthReady || isLoading) {
    return (
      <LoadingSpinner 
        text="טוען את פרופיל המשתמש..." 
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-500 text-xl font-bold mb-4">שגיאה בטעינת הנתונים</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => { 
                setIsLoading(true);
                setError('');
                Promise.all([loadUserData(), fetchWeddingPreferences()])
                  .finally(() => setIsLoading(false));
              }}
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
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-800 mb-4 px-2">
            היי {profile.fullName} ו{profile.partnerName}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl mb-4">היום הגדול מתקרב!</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 max-w-lg sm:max-w-none mx-auto">
            <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg">
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-700">{timeLeft.days}</span>
              <span className="text-xs sm:text-sm text-gray-600">ימים</span>
            </div>
            <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg">
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700">{timeLeft.hours}</span>
              <span className="text-xs sm:text-sm text-gray-600">שעות</span>
            </div>
            <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 p-3 sm:p-4 rounded-lg">
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700">{timeLeft.minutes}</span>
              <span className="text-xs sm:text-sm text-gray-600">דקות</span>
            </div>
            <div className="text-center bg-gradient-to-br from-pink-50 to-red-50 p-3 sm:p-4 rounded-lg">
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-red-700">{timeLeft.seconds}</span>
              <span className="text-xs sm:text-sm text-gray-600">שניות</span>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-gray-600 px-2">
            תאריך החתונה: {new Date(profile.weddingDate).toLocaleDateString('he-IL')}
          </p>
        </div>

        {/* Grid עם קטעים של ניתוח תקציב והארנק */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* ניתוח תקציב */}
          {budgetAnalysis.categories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 xl:col-span-2">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">ניתוח תקציב</h3>
              <div className="w-full overflow-hidden">
                <Bar
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
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      },
                      title: {
                        display: true,
                        text: 'התפלגות הוצאות לפי קטגוריה',
                        font: {
                          size: window.innerWidth < 640 ? 12 : 14
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      },
                      y: {
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      }
                    }
                  }}
                  height={window.innerWidth < 640 ? 200 : 250}
                />
              </div>
            </div>
          )}
          
          {/* הארנק */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">הארנק שלי</h3>
            
            <div className="space-y-3 sm:space-y-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">תקציב כולל</p>
                <p className="text-lg sm:text-xl font-bold text-blue-700">₪{walletInfo.totalBudget.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">הוצאות</p>
                <p className="text-lg sm:text-xl font-bold text-red-600">₪{walletInfo.spentBudget.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">נותר</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">₪{walletInfo.remainingBudget.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((walletInfo.spentBudget / walletInfo.totalBudget) * 100, 100)}%` }}
              ></div>
            </div>
            
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                {Math.round((walletInfo.spentBudget / walletInfo.totalBudget) * 100)}% מהתקציב נוצל
              </p>
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