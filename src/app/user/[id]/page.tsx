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
      
      <main className="container mx-auto px-4 py-8">
        {/* כרטיס ספירה לאחור */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <h1 className="text-3xl font-bold text-purple-800 mb-4">
            היי {profile.fullName} ו{profile.partnerName}
          </h1>
          <p className="text-xl mb-4">היום הגדול מתקרב!</p>
          
          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <span className="block text-4xl font-bold">{timeLeft.days}</span>
              <span className="text-sm">ימים</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-bold">{timeLeft.hours}</span>
              <span className="text-sm">שעות</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-bold">{timeLeft.minutes}</span>
              <span className="text-sm">דקות</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-bold">{timeLeft.seconds}</span>
              <span className="text-sm">שניות</span>
            </div>
          </div>
          
          <p className="text-gray-600">
            תאריך החתונה: {new Date(profile.weddingDate).toLocaleDateString('he-IL')}
          </p>
        </div>

        {/* Grid עם קטעים של ניתוח תקציב והארנק */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* ניתוח תקציב */}
          {budgetAnalysis.categories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4">ניתוח תקציב</h3>
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
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'התפלגות הוצאות לפי קטגוריה'
                    }
                  }
                }}
              />
            </div>
          )}
          
          {/* הארנק */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-4">הארנק שלי</h3>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">תקציב כולל</p>
                <p className="text-xl font-bold">₪{walletInfo.totalBudget.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">הוצאות</p>
                <p className="text-xl font-bold text-red-500">₪{walletInfo.spentBudget.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">נותר</p>
                <p className="text-xl font-bold text-green-500">₪{walletInfo.remainingBudget.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((walletInfo.spentBudget / walletInfo.totalBudget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* הוצאות אחרונות */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-xl font-semibold mb-4">הוצאות אחרונות</h3>
          {walletInfo.lastTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 text-right">שם הפריט</th>
                    <th className="py-2 px-4 text-right">סכום</th>
                    <th className="py-2 px-4 text-right">תאריך</th>
                  </tr>
                </thead>
                <tbody>
                  {walletInfo.lastTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-4">{transaction.itemName}</td>
                      <td className="py-2 px-4 font-medium">₪{transaction.amount.toLocaleString()}</td>
                      <td className="py-2 px-4 text-gray-600">{new Date(transaction.date).toLocaleDateString('he-IL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">אין הוצאות אחרונות</p>
          )}
        </div>
        
        {/* פרטי הפרופיל */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">פרטי פרופיל</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-2">פרטים אישיים</h4>
              <div className="space-y-2">
                <p><span className="font-medium">שם מלא:</span> {profile.fullName}</p>
                <p><span className="font-medium">אימייל:</span> {profile.email}</p>
                <p><span className="font-medium">טלפון:</span> {profile.phoneNumber}</p>
              </div>
              
              <h4 className="text-lg font-medium mt-4 mb-2">פרטי בן/בת הזוג</h4>
              <div className="space-y-2">
                <p><span className="font-medium">שם:</span> {profile.partnerName}</p>
                <p><span className="font-medium">טלפון:</span> {profile.partnerPhone}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-2">פרטי החתונה</h4>
              <div className="space-y-2">
                <p><span className="font-medium">תאריך:</span> {new Date(profile.weddingDate).toLocaleDateString('he-IL')}</p>
                <p><span className="font-medium">מיקום:</span> {profile.weddingLocation}</p>
                <p><span className="font-medium">מספר אורחים:</span> {profile.expectedGuests}</p>
                <p><span className="font-medium">תקציב:</span> ₪{parseInt(profile.budget).toLocaleString()}</p>
              </div>
              
              <h4 className="text-lg font-medium mt-4 mb-2">שירותים נדרשים</h4>
              <div className="space-y-1">
                {profile.preferences.venue && <p className="text-green-600">✓ אולם אירועים</p>}
                {profile.preferences.catering && <p className="text-green-600">✓ קייטרינג</p>}
                {profile.preferences.photography && <p className="text-green-600">✓ צילום</p>}
                {profile.preferences.music && <p className="text-green-600">✓ מוזיקה</p>}
                {profile.preferences.design && <p className="text-green-600">✓ עיצוב</p>}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => router.push(`/user/${profile._id}/edit`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ערוך פרופיל
            </button>
            {profile.authProvider === 'google' && (
              <button
                onClick={() => router.push(`/set-password?email=${encodeURIComponent(profile.email)}`)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
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