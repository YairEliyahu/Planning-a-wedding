import { ChecklistItem, Category, FilterType, SortType, ChartData } from '../types';
import { chartColors, chartBorderColors } from '../constants/defaultData';

// סינון ומיון פריטים
export const filterAndSortItems = (
  items: ChecklistItem[], 
  filter: FilterType, 
  sortBy: SortType
): ChecklistItem[] => {
  let filtered = items;
  
  // סינון לפי סטטוס
  if (filter === 'completed') {
    filtered = items.filter(item => item.isCompleted);
  } else if (filter === 'pending') {
    filtered = items.filter(item => !item.isCompleted);
  }

  // מיון
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

// יצירת נתוני גרף
export const generateChartData = (
  categories: Category[], 
  expectedIncome: number
): ChartData => {
  const categoryTotals = categories.reduce((acc, category) => {
    const total = category.items.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
    if (total > 0) {
      acc[category.name] = total;
    }
    return acc;
  }, {} as { [key: string]: number });

  // מיפוי צבעים לפי שם קטגוריה
  const getCategoryColor = (categoryName: string, isBackground = true) => {
    const colorMap = isBackground ? chartColors : chartBorderColors;
    
    switch (categoryName) {
      case 'אולם':
        return colorMap.venue;
      case 'ספקים':
        return colorMap.vendors;
      case 'לבוש':
        return colorMap.clothing;
      case 'חופה וקידושין':
        return colorMap.ceremony;
      case 'שונות':
        return colorMap.misc;
      default:
        return colorMap.misc;
    }
  };

  const labels = ['הכנסות צפויות', ...Object.keys(categoryTotals)];
  const data = [expectedIncome, ...Object.values(categoryTotals)];
  
  const backgroundColor = [
    chartColors.income,
    ...Object.keys(categoryTotals).map(name => getCategoryColor(name, true))
  ];
  
  const borderColor = [
    chartBorderColors.income,
    ...Object.keys(categoryTotals).map(name => getCategoryColor(name, false))
  ];

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };
};

// יצירת אפשרויות הגרף
export const generateChartOptions = (expectedIncome: number, totalExpenses: number) => {
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
          label: function(context: any) {
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

// וולידציה של קלט מספרי
export const validateNumericInput = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};

// פורמט מספר עם פסיקים
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// חישוב אחוז התקדמות עבור קטגוריה ספציפית
export const calculateCategoryProgress = (category: Category): number => {
  if (!category.items || category.items.length === 0) return 0;
  
  const completed = category.items.filter(item => item.isCompleted).length;
  return Math.round((completed / category.items.length) * 100);
};

// קבלת CSS class לפי עדיפות
export const getPriorityClass = (priority?: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// קבלת תווית עדיפות
export const getPriorityLabel = (priority?: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'high':
      return 'דחוף';
    case 'medium':
      return 'רגיל';
    case 'low':
      return 'נמוך';
    default:
      return 'לא מוגדר';
  }
}; 