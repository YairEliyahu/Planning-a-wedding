'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Scale, CoreScaleOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthReady) {
        console.log('Auth not ready yet');
        return;
      }

      console.log('Auth state:', { isAuthReady, user: user?._id });

      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      if (user._id !== params.id) {
        console.log('User ID mismatch:', { userId: user._id, paramsId: params.id });
        router.push(`/user/${user._id}`);
        return;
      }

      await Promise.all([
        fetchUserProfile(),
        fetchWeddingPreferences(),
        fetchChecklistData()
      ]);
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  const fetchChecklistData = async () => {
    try {
      const response = await fetch(`/api/wedding-checklist/${params.id}`);
      const data = await response.json();
      if (response.ok && data.checklist) {
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
      }
    } catch (error) {
      console.error('Failed to fetch checklist data:', error);
    }
  };

  const fetchWeddingPreferences = async () => {
    try {
      const response = await fetch(`/api/wedding-preferences/${params.id}`);
      const data = await response.json();
      if (response.ok && data.preferences) {
        // עשאיר את הפונקציה הזו ריקה כי אנחנו מקבלים את הנתונים מהצ'ק ליסט
      }
    } catch (error) {
      console.error('Failed to fetch wedding preferences:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      if (!data.user.isProfileComplete) {
        router.push('/complete-profile');
        return;
      }

      setProfile(data.user);
      setError('');

      // חישוב הזמן שנותר עד החתונה
      if (data.user.weddingDate) {
        const calculateTimeLeft = () => {
          const weddingTime = new Date(data.user.weddingDate).getTime();
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
      }

    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">הפרופיל לא נמצא</div>
      </div>
    );
  }

  const chartData = {
    labels: ['הכנסות צפויות', 'הוצאות משוערות'],
    datasets: [
      {
        label: 'סכום בש"ח',
        data: [budgetAnalysis.expectedIncome, budgetAnalysis.estimatedExpenses],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          budgetAnalysis.expectedIncome >= budgetAnalysis.estimatedExpenses 
            ? 'rgba(255, 99, 132, 0.6)' 
            : 'rgba(255, 0, 0, 0.6)'
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          budgetAnalysis.expectedIncome >= budgetAnalysis.estimatedExpenses 
            ? 'rgb(255, 99, 132)' 
            : 'rgb(255, 0, 0)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Heebo, sans-serif'
          }
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            return `₪${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20">
        <div className="max-w-4xl mx-auto p-6">
          {/* כרטיס ספירה לאחור */}
          <div style={styles.welcomeCard}>
            <h1 className="text-5xl font-bold text-purple-800 text-center mb-12 font-mplus drop-shadow-sm">
              היי {profile.fullName} ו{profile.partnerName}
            </h1>
            <p style={styles.subtitle}>היום הגדול מתקרב ובא!</p>
            
            <div style={styles.countdownContainer}>
              <div style={styles.countdownItem}>
                <span style={styles.number}>{timeLeft.seconds}</span>
                <span style={styles.label}>שניות</span>
              </div>
              <div style={styles.countdownItem}>
                <span style={styles.number}>{timeLeft.minutes}</span>
                <span style={styles.label}>דקות</span>
              </div>
              <div style={styles.countdownItem}>
                <span style={styles.number}>{timeLeft.hours}</span>
                <span style={styles.label}>שעות</span>
              </div>
              <div style={styles.countdownItem}>
                <span style={styles.number}>{timeLeft.days}</span>
                <span style={styles.label}>ימים</span>
              </div>
            </div>

            <p style={styles.weddingDate}>
              תאריך החתונה: {new Date(profile.weddingDate).toLocaleDateString('he-IL')}
            </p>
          </div>

          {/* כרטיס ארנק */}
          <div style={styles.walletCard}>
            <h2 style={styles.walletTitle}>הארנק שלי</h2>
            
            <div style={styles.budgetOverview}>
              <div style={styles.budgetItem}>
                <span style={styles.budgetLabel}>תקציב כולל</span>
                <span style={styles.budgetAmount}>₪{walletInfo.totalBudget.toLocaleString()}</span>
              </div>
              
              <div style={styles.budgetItem}>
                <span style={styles.budgetLabel}>הוצאות</span>
                <span style={styles.spentAmount}>₪{walletInfo.spentBudget.toLocaleString()}</span>
              </div>
              
              <div style={styles.budgetItem}>
                <span style={styles.budgetLabel}>נותר</span>
                <span style={styles.remainingAmount}>₪{walletInfo.remainingBudget.toLocaleString()}</span>
              </div>
            </div>

            <div style={styles.progressBarContainer}>
              <div 
                style={{
                  ...styles.progressBar,
                  width: `${(walletInfo.spentBudget / walletInfo.totalBudget) * 100}%`
                }}
              />
            </div>

            {/* גרף הכנסות והוצאות */}
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>ניתוח תקציב</h3>
              <div style={styles.chart}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* פירוט הוצאות לפי קטגוריות */}
            <div style={styles.categoriesContainer}>
              <h3 style={styles.categoriesTitle}>חלוקת תקציב משוערת</h3>
              <div style={styles.categoriesGrid}>
                {budgetAnalysis.categories.map((category, index) => (
                  <div key={index} style={styles.categoryItem}>
                    <span style={styles.categoryName}>{category.name}</span>
                    <span style={styles.categoryAmount}>₪{category.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.transactionsContainer}>
              <h3 style={styles.transactionsTitle}>הוצאות אחרונות</h3>
              {walletInfo.lastTransactions.length > 0 ? (
                walletInfo.lastTransactions.map((transaction, index) => (
                  <div key={index} style={styles.transaction}>
                    <span style={styles.transactionName}>{transaction.itemName}</span>
                    <span style={styles.transactionAmount}>₪{transaction.amount.toLocaleString()}</span>
                    <span style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#666' }}>אין הוצאות אחרונות</p>
              )}
            </div>
          </div>

          {/* כרטיס פרטי פרופיל */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">פרטים אישיים</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">שם מלא:</span> {profile.fullName}</p>
                    <p><span className="font-medium">אימייל:</span> {profile.email}</p>
                    <p><span className="font-medium">טלפון:</span> {profile.phoneNumber}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">פרטי בן/בת הזוג</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">שם:</span> {profile.partnerName}</p>
                    <p><span className="font-medium">טלפון:</span> {profile.partnerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">פרטי החתונה</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">תאריך:</span> {new Date(profile.weddingDate).toLocaleDateString('he-IL')}</p>
                    <p><span className="font-medium">מיקום:</span> {profile.weddingLocation}</p>
                    <p><span className="font-medium">מספר אורחים:</span> {profile.expectedGuests}</p>
                    <p><span className="font-medium">תקציב:</span> ₪{parseInt(profile.budget).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">שירותים נדרשים</h3>
                  <div className="space-y-2">
                    {profile.preferences.venue && <p>✓ אולם אירועים</p>}
                    {profile.preferences.catering && <p>✓ קייטרינג</p>}
                    {profile.preferences.photography && <p>✓ צילום</p>}
                    {profile.preferences.music && <p>✓ מוזיקה</p>}
                    {profile.preferences.design && <p>✓ עיצוב</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => router.push(`/user/${profile._id}/edit`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ערוך פרופיל
              </button>
              {profile.authProvider === 'google' && (
                <button
                  onClick={() => router.push(`/user/${profile._id}/set-password`)}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  הגדר סיסמה
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  welcomeCard: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '2rem',
  },
  countdownContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    margin: '2rem 0',
  },
  countdownItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  number: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#0070f3',
  },
  label: {
    fontSize: '1.1rem',
    color: '#333',
    fontWeight: '500',
  },
  weddingDate: {
    fontSize: '1.1rem',
    color: '#333',
    marginTop: '2rem',
  },
  walletCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginTop: '2rem',
  },
  walletTitle: {
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  budgetOverview: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  budgetItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    flex: 1,
  },
  budgetLabel: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  budgetAmount: {
    fontSize: '1.5rem',
    color: '#0070f3',
    fontWeight: 'bold',
  },
  spentAmount: {
    fontSize: '1.5rem',
    color: '#ff4444',
    fontWeight: 'bold',
  },
  remainingAmount: {
    fontSize: '1.5rem',
    color: '#00c853',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '2rem',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0070f3',
    transition: 'width 0.3s ease',
  },
  transactionsContainer: {
    marginTop: '1.5rem',
  },
  transactionsTitle: {
    fontSize: '1.2rem',
    color: '#333',
    marginBottom: '1rem',
  },
  transaction: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #eee',
  },
  transactionName: {
    flex: 1,
    fontSize: '1rem',
    color: '#333',
  },
  transactionAmount: {
    fontSize: '1rem',
    color: '#ff4444',
    marginRight: '1rem',
    minWidth: '100px',
    textAlign: 'right' as const,
  },
  transactionDate: {
    fontSize: '0.9rem',
    color: '#666',
    minWidth: '100px',
    textAlign: 'right' as const,
  },
  chartContainer: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  chartTitle: {
    fontSize: '1.4rem',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  chart: {
    maxHeight: '300px',
  },
  categoriesContainer: {
    marginTop: '2rem',
    padding: '1rem',
  },
  categoriesTitle: {
    fontSize: '1.2rem',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  categoryName: {
    fontSize: '1rem',
    color: '#333',
  },
  categoryAmount: {
    fontSize: '1rem',
    color: '#0070f3',
    fontWeight: 'bold',
  },
};