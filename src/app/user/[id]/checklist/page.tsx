'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import LoadingSpinner from '../../../components/LoadingSpinner';

ChartJS.register(ArcElement, Tooltip, Legend);

// קאש לנתונים - מונע בקשות חוזרות
const dataCache = new Map();

interface ChecklistItem {
  id: string;
  category: string;
  subCategory: string;
  name: string;
  isCompleted: boolean;
  budget: string;
  notes?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  guestCount?: number;
  averageGift?: number;
  costPerPerson?: number;
}

interface Category {
  name: string;
  items: ChecklistItem[];
  isExpanded: boolean;
  icon?: string;
  description?: string;
}

const defaultCategories: Category[] = [
  {
    name: 'אולם',
    items: [
      { 
        id: '1', 
        category: 'אולם', 
        subCategory: 'כללי', 
        name: 'התחייבות כמות אורחים לאולם', 
        isCompleted: false, 
        budget: '', 
        priority: 'high',
        guestCount: 0,
        averageGift: 0,
        costPerPerson: 0
      },
      { id: '2', category: 'אולם', subCategory: 'טכני', name: 'הוצאות תאורה הגברה ומסכים', isCompleted: false, budget: '', priority: 'medium' },
      { id: '3', category: 'אולם', subCategory: 'עיצוב', name: 'עיצוב אולם וחופה', isCompleted: false, budget: '', priority: 'medium' },
    ],
    isExpanded: true,
    icon: '🏰',
    description: 'כל מה שקשור למקום האירוע'
  },
  {
    name: 'ספקים',
    items: [
      { id: '4', category: 'ספקים', subCategory: 'צילום', name: 'צלם וידאו', isCompleted: false, budget: '', priority: 'high' },
      { id: '5', category: 'ספקים', subCategory: 'צילום', name: 'צלם סטילס', isCompleted: false, budget: '', priority: 'high' },
      { id: '6', category: 'ספקים', subCategory: 'מוזיקה', name: 'DJ', isCompleted: false, budget: '', priority: 'high' },
      { id: '7', category: 'ספקים', subCategory: 'מזכרות', name: 'מגנטים', isCompleted: false, budget: '', priority: 'low' },
      { id: '8', category: 'ספקים', subCategory: 'משקאות', name: 'אלכוהול', isCompleted: false, budget: '', priority: 'medium' },
      { id: '9', category: 'ספקים', subCategory: 'משקאות', name: 'שירותי מזיגה', isCompleted: false, budget: '', priority: 'medium' },
    ],
    isExpanded: true,
    icon: '👥',
    description: 'ספקים ונותני שירות'
  },
  {
    name: 'לבוש',
    items: [
      { id: '10', category: 'לבוש', subCategory: 'כלה', name: 'שמלת כלה', isCompleted: false, budget: '', priority: 'high' },
      { id: '11', category: 'לבוש', subCategory: 'כלה', name: 'שמלה 2', isCompleted: false, budget: '', priority: 'low' },
      { id: '12', category: 'לבוש', subCategory: 'חתן', name: 'חליפת חתן', isCompleted: false, budget: '', priority: 'high' },
      { id: '13', category: 'לבוש', subCategory: 'תכשיטים', name: 'טבעות נישואים', isCompleted: false, budget: '', priority: 'high' },
    ],
    isExpanded: true,
    icon: '👗',
    description: 'ביגוד ואביזרים'
  },
  {
    name: 'חופה וקידושין',
    items: [
      { id: '14', category: 'חופה וקידושין', subCategory: 'דת', name: 'רב', isCompleted: false, budget: '', priority: 'high' },
      { id: '15', category: 'חופה וקידושין', subCategory: 'דת', name: 'טלית', isCompleted: false, budget: '', priority: 'medium' },
      { id: '16', category: 'חופה וקידושין', subCategory: 'כללי', name: 'הוצאות חופה כללי', isCompleted: false, budget: '', priority: 'medium' },
    ],
    isExpanded: true,
    icon: '✡️',
    description: 'טקס החופה והקידושין'
  },
  {
    name: 'שונות',
    items: [
      { id: '17', category: 'שונות', subCategory: 'כללי', name: 'הזמנות', isCompleted: false, budget: '', priority: 'medium' },
      { id: '18', category: 'שונות', subCategory: 'כללי', name: 'מתנות לאורחים', isCompleted: false, budget: '', priority: 'low' },
      { id: '19', category: 'שונות', subCategory: 'כללי', name: 'הסעות', isCompleted: false, budget: '', priority: 'medium' },
    ],
    isExpanded: true,
    icon: '📝',
    description: 'משימות נוספות'
  }
];

export default function ChecklistPage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'budget'>('priority');
  const [expectedIncome, setExpectedIncome] = useState<number>(0);
  const [venueTotalCost, setVenueTotalCost] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    const checkAuth = async () => {
      if (!isAuthReady) return;

      if (!user) {
        router.push('/login');
        return;
      }

      if (user._id !== params.id) {
        router.push(`/user/${user._id}/checklist`);
        return;
      }

      try {
        await fetchChecklist();
      } catch (err) {
        setError('אירעה שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  // רענון אוטומטי של נתוני הצ'קליסט אם המשתמש מחובר למשתמש אחר
  useEffect(() => {
    if (user && user.connectedUserId) {
      console.log(`User has connected account ${user.connectedUserId}, setting up auto-refresh for checklist`);
      let autoRefreshInterval: NodeJS.Timeout;

      // רענון ראשוני
      const initialDelay = setTimeout(() => {
        console.log('Initial refresh of checklist for connected accounts');
        dataCache.clear(); // ניקוי מטמון
        fetchChecklist();

        // רענון כל 30 שניות
        autoRefreshInterval = setInterval(() => {
          console.log('Auto-refreshing checklist for connected accounts...');
          // ניקוי המטמון לפני הרענון כדי לקבל תמיד את הנתונים העדכניים ביותר
          dataCache.clear();
          fetchChecklist();
        }, 30000); // 30 seconds refresh
      }, 5000); // Initial delay of 5 seconds

      // ניקוי בעת עזיבת הקומפוננטה
      return () => {
        clearTimeout(initialDelay);
        clearInterval(autoRefreshInterval);
      };
    }
  }, [user]);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setCategories(defaultCategories);
    }
  }, [categories]);

  const fetchChecklist = async () => {
    try {
      const cacheKey = `checklist-${params.id}`;
      const data = await fetchWithCache(`/api/wedding-checklist/${params.id}`, cacheKey);
      
      if (data.checklist) {
        setCategories(data.checklist);
        const venueItem = data.checklist[0]?.items[0];
        if (venueItem) {
          const guestCount = venueItem.guestCount || 0;
          const averageGift = venueItem.averageGift || 0;
          const costPerPerson = venueItem.costPerPerson || 0;
          setExpectedIncome(guestCount * averageGift);
          setVenueTotalCost(guestCount * costPerPerson);
        }
      } else {
        setCategories(defaultCategories);
        setExpectedIncome(0);
        setVenueTotalCost(0);
      }
    } catch (error) {
      console.error('Failed to fetch checklist:', error);
      setCategories(defaultCategories);
      setExpectedIncome(0);
      setVenueTotalCost(0);
      throw error;
    }
  };

  const handleToggleItem = async (itemId: string) => {
    const updatedCategories = categories.map(category => ({
      ...category,
      items: category.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            isCompleted: !item.isCompleted
          };
        }
        return item;
      })
    }));

    setCategories(updatedCategories);
    await saveChecklist(updatedCategories);
  };

  const handleAddItem = async (categoryName: string) => {
    if (!newItemName.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      category: categoryName,
      subCategory: 'כללי',
      name: newItemName,
      isCompleted: false,
      budget: '',
      priority: 'medium'
    };

    const updatedCategories = categories.map(category => 
      category.name === categoryName
        ? { ...category, items: [...category.items, newItem] }
        : category
    );

    setCategories(updatedCategories);
    setNewItemName('');
    setIsAddingItem(false);
    setSelectedCategory('');
    await saveChecklist(updatedCategories);
  };

  const handleToggleCategory = (categoryName: string) => {
    setCategories(categories.map(category => 
      category.name === categoryName
        ? { ...category, isExpanded: !category.isExpanded }
        : category
    ));
  };

  const handleBudgetChange = async (itemId: string, value: string) => {
    const updatedCategories = categories.map(category => ({
      ...category,
      items: category.items.map(item => 
        item.id === itemId ? { ...item, budget: value } : item
      )
    }));

    setCategories(updatedCategories);
    await saveChecklist(updatedCategories);
  };

  const handleGuestCountChange = async (itemId: string, value: string) => {
    const updatedCategories = categories.map(category => ({
      ...category,
      items: category.items.map(item => {
        if (item.id === itemId) {
          const guestCount = value === '' ? 0 : parseInt(value);
          const costPerPerson = item.costPerPerson || 0;
          const totalVenueCost = guestCount * costPerPerson;
          
          return {
            ...item,
            guestCount,
            budget: totalVenueCost.toString()
          };
        }
        return item;
      })
    }));

    setCategories(updatedCategories);
    setVenueTotalCost((updatedCategories[0].items[0].guestCount || 0) * (updatedCategories[0].items[0].costPerPerson || 0));
    setExpectedIncome((updatedCategories[0].items[0].guestCount || 0) * (updatedCategories[0].items[0].averageGift || 0));
    await saveChecklist(updatedCategories);
  };

  const handleAverageGiftChange = async (itemId: string, value: string) => {
    const updatedCategories = categories.map(category => ({
      ...category,
      items: category.items.map(item => {
        if (item.id === itemId) {
          const averageGift = value === '' ? 0 : parseInt(value);
          
          return {
            ...item,
            averageGift
          };
        }
        return item;
      })
    }));

    setCategories(updatedCategories);
    setExpectedIncome((updatedCategories[0].items[0].guestCount || 0) * (updatedCategories[0].items[0].averageGift || 0));
    await saveChecklist(updatedCategories);
  };

  const handleCostPerPersonChange = async (itemId: string, value: string) => {
    const updatedCategories = categories.map(category => ({
      ...category,
      items: category.items.map(item => {
        if (item.id === itemId) {
          const costPerPerson = value === '' ? 0 : parseInt(value);
          const guestCount = item.guestCount || 0;
          const totalVenueCost = guestCount * costPerPerson;
          
          return {
            ...item,
            costPerPerson,
            budget: totalVenueCost.toString()
          };
        }
        return item;
      })
    }));

    setCategories(updatedCategories);
    setVenueTotalCost((updatedCategories[0].items[0].guestCount || 0) * (updatedCategories[0].items[0].costPerPerson || 0));
    await saveChecklist(updatedCategories);
  };

  const saveChecklist = async (updatedCategories: Category[]) => {
    try {
      const response = await fetch(`/api/wedding-checklist/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: updatedCategories }),
      });
      if (response.ok) {
        const cacheKey = `checklist-${params.id}`;
        dataCache.set(cacheKey, { checklist: updatedCategories });
      }
    } catch (error) {
      console.error('Failed to save checklist:', error);
    }
  };

  const getTotalBudget = () => {
    if (!Array.isArray(categories)) return 0;
    
    return categories.reduce((total, category) => {
      if (!Array.isArray(category.items)) return total;
      
      return total + category.items.reduce((sum, item) => 
        sum + (Number(item.budget) || 0), 0
      );
    }, 0);
  };

  const getProgress = () => {
    if (!Array.isArray(categories)) return 0;
    
    let total = 0;
    let completed = 0;

    for (const category of categories) {
      if (Array.isArray(category.items)) {
        total += category.items.length;
        completed += category.items.filter(item => item.isCompleted).length;
      }
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const filterItems = (items: ChecklistItem[]) => {
    let filtered = items;
    
    if (filter === 'completed') {
      filtered = items.filter(item => item.isCompleted);
    } else if (filter === 'pending') {
      filtered = items.filter(item => !item.isCompleted);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority || 'low'] || 0) - (priorityOrder[b.priority || 'low'] || 0);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return Number(b.budget || 0) - Number(a.budget || 0);
      }
    });
  };

  const handleReset = async () => {
    const resetCategories = categories.map(category => ({
      ...category,
      items: category.items.map(item => ({
        ...item,
        isCompleted: false,
        budget: '',
        guestCount: 0,
        averageGift: 0,
        costPerPerson: 0
      }))
    }));

    setCategories(resetCategories);
    setExpectedIncome(0);
    setVenueTotalCost(0);
    await saveChecklist(resetCategories);
    setShowResetConfirm(false);
  };

  const getChartData = () => {
    const categoryTotals = categories.reduce((acc, category) => {
      const total = category.items.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
      if (total > 0) {
        acc[category.name] = total;
      }
      return acc;
    }, {} as { [key: string]: number });

    const data = {
      labels: ['הכנסות צפויות', ...Object.keys(categoryTotals)],
      datasets: [
        {
          data: [expectedIncome, ...Object.values(categoryTotals)],
          backgroundColor: [
            'rgba(34, 197, 94, 0.6)', // ירוק להכנסות
            'rgba(239, 68, 68, 0.6)',  // אדום לאולם
            'rgba(59, 130, 246, 0.6)', // כחול לספקים
            'rgba(168, 85, 247, 0.6)', // סגול ללבוש
            'rgba(251, 191, 36, 0.6)', // צהוב לחופה וקידושין
            'rgba(107, 114, 128, 0.6)' // אפור לשונות
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(107, 114, 128, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };

    return data;
  };

  const getChartOptions = () => {
    const totalExpenses = getTotalBudget();
    const balance = expectedIncome - totalExpenses;
    const isProfit = balance >= 0;

    return {
      plugins: {
        legend: {
          position: 'bottom' as const,
          rtl: true,
          labels: {
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: TooltipItem<'pie'>) {
              const label = context.label || '';
              const value = context.raw as number || 0;
              return `${label}: ₪${value.toLocaleString()}`;
            },
            afterBody: function() {
              return [
                `סה"כ הוצאות: ₪${totalExpenses.toLocaleString()}`,
                `${isProfit ? 'רווח' : 'הפסד'}: ₪${Math.abs(balance).toLocaleString()}`
              ];
            }
          }
        }
      },
      maintainAspectRatio: false
    };
  };

  // Show loading spinner while loading
  if (!isAuthReady || isLoading) {
    return (
      <LoadingSpinner 
        text="טוען את הצ'קליסט..." 
        size="large"
        fullScreen={true}
        color="pink"
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error} <button className="underline ml-2" onClick={() => { setIsLoading(true); fetchChecklist().finally(() => setIsLoading(false)); }}>נסה שוב</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="fixed left-4 top-24 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>אפס נתונים</span>
        </button>

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">אישור איפוס נתונים</h3>
              <p className="text-gray-600 mb-6">
                האם אתה בטוח שברצונך לאפס את כל הנתונים? פעולה זו לא ניתנת לביטול.
              </p>
              <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  לא
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  כן, אפס הכל
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">צ&apos;קליסט חתונה</h1>
            <p className="text-gray-600 text-lg mb-4">עקבו אחר המשימות והתקציב שלכם בדרך לחתונה המושלמת</p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6 min-w-[200px]">
                <div className="text-2xl font-bold text-blue-600">
                  ₪{getTotalBudget().toLocaleString()}
                </div>
                <div className="text-gray-600">סה&quot;כ הוצאות בחתונה</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 min-w-[200px]">
                <div className="text-2xl font-bold text-green-600">
                  {getProgress()}%
                </div>
                <div className="text-gray-600">הושלמו</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 min-w-[200px]">
                <div className="text-2xl font-bold text-purple-600">
                  ₪{expectedIncome.toLocaleString()}
                </div>
                <div className="text-gray-600">צפי הכנסות ממתנות</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 min-w-[200px]">
                <div className="text-2xl font-bold text-red-600">
                  ₪{venueTotalCost.toLocaleString()}
                </div>
                <div className="text-gray-600">סה&quot;כ עלות אולם</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ניתוח הכנסות והוצאות</h3>
              <div className="h-[400px] relative">
                <Pie data={getChartData()} options={getChartOptions()} />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'pending')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">כל המשימות</option>
                <option value="completed">הושלמו</option>
                <option value="pending">בהמתנה</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'priority' | 'name' | 'budget')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">מיון לפי עדיפות</option>
                <option value="name">מיון לפי שם</option>
                <option value="budget">מיון לפי תקציב</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(categories) && categories.map((category) => (
              <div 
                key={category.name} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setIsAddingItem(true);
                        }}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        title="הוסף פריט חדש"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => handleToggleCategory(category.name)}
                      className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      title={category.isExpanded ? 'כווץ קטגוריה' : 'הרחב קטגוריה'}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 transform transition-transform duration-200 ${category.isExpanded ? 'rotate-180' : ''}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {category.isExpanded && (
                    <div className="space-y-3">
                      {filterItems(category.items).map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center p-4 rounded-lg transition-colors duration-200 ${
                            item.isCompleted ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              onChange={() => handleToggleItem(item.id)}
                              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 cursor-pointer"
                            />
                            {item.isCompleted && (
                              <svg
                                className="absolute w-4 h-4 text-green-500 transform translate-x-0.5 translate-y-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="mr-4 flex-1">
                            <div className="flex items-center">
                              <span className={`text-lg ${
                                item.isCompleted 
                                  ? 'line-through text-gray-500' 
                                  : 'text-gray-700'
                              }`}>
                                {item.name}
                              </span>
                              {item.priority && (
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  item.priority === 'high' 
                                    ? 'bg-red-100 text-red-800'
                                    : item.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {item.priority === 'high' ? 'דחוף' : item.priority === 'medium' ? 'רגיל' : 'נמוך'}
                                </span>
                              )}
                            </div>
                            {item.subCategory && (
                              <span className="block text-sm text-gray-500">
                                {item.subCategory}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            {item.id === '1' && (
                              <>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <input
                                    type="number"
                                    value={item.guestCount === 0 ? '' : item.guestCount}
                                    onChange={(e) => handleGuestCountChange(item.id, e.target.value)}
                                    placeholder="כמות אורחים"
                                    className="w-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                  />
                                  <span className="text-sm text-gray-500">אורחים</span>
                                </div>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={item.costPerPerson === 0 ? '' : item.costPerPerson}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, '');
                                      handleCostPerPersonChange(item.id, value);
                                    }}
                                    placeholder="מחיר למנה"
                                    className="w-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-500">₪ למנה</span>
                                </div>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                  <input
                                    type="number"
                                    value={item.averageGift === 0 ? '' : item.averageGift}
                                    onChange={(e) => handleAverageGiftChange(item.id, e.target.value)}
                                    placeholder="ממוצע למעטפה"
                                    className="w-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="1"
                                  />
                                  <span className="text-sm text-gray-500">₪ למעטפה</span>
                                </div>
                              </>
                            )}
                            {item.id !== '1' && (
                              <div className="relative">
                                <input
                                  type="number"
                                  value={item.budget}
                                  onChange={(e) => handleBudgetChange(item.id, e.target.value)}
                                  placeholder="תקציב"
                                  className="w-32 p-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                  step="100"
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {isAddingItem && selectedCategory === category.name && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="הוסף פריט חדש"
                            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex justify-end mt-3 space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => handleAddItem(category.name)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                              הוסף
                            </button>
                            <button
                              onClick={() => {
                                setIsAddingItem(false);
                                setNewItemName('');
                                setSelectedCategory('');
                              }}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                              ביטול
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}