import { Category } from '../types';

export const defaultCategories: Category[] = [
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

export const chartColors = {
  income: 'rgba(34, 197, 94, 0.6)', // ירוק להכנסות
  venue: 'rgba(239, 68, 68, 0.6)',  // אדום לאולם
  vendors: 'rgba(59, 130, 246, 0.6)', // כחול לספקים
  clothing: 'rgba(168, 85, 247, 0.6)', // סגול ללבוש
  ceremony: 'rgba(251, 191, 36, 0.6)', // צהוב לחופה וקידושין
  misc: 'rgba(107, 114, 128, 0.6)' // אפור לשונות
};

export const chartBorderColors = {
  income: 'rgba(34, 197, 94, 1)',
  venue: 'rgba(239, 68, 68, 1)',
  vendors: 'rgba(59, 130, 246, 1)',
  clothing: 'rgba(168, 85, 247, 1)',
  ceremony: 'rgba(251, 191, 36, 1)',
  misc: 'rgba(107, 114, 128, 1)'
};

export const priorityLabels = {
  high: 'דחוף',
  medium: 'רגיל',
  low: 'נמוך'
} as const;

export const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
} as const; 