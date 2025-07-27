'use client';

import { useChecklistContext } from '../context/ChecklistContext';
import { formatNumber } from '../utils/checklistUtils';

export default function SummaryCards() {
  const { summary, isSaving, showSaveSuccess } = useChecklistContext();

  const cards = [
    {
      title: 'סה"כ הוצאות בחתונה',
      value: `₪${formatNumber(summary.totalBudget)}`,
      color: 'text-blue-600'
    },
    {
      title: 'הושלמו',
      value: `${summary.progress}%`,
      color: 'text-green-600'
    },
    {
      title: 'צפי הכנסות ממתנות',
      value: `₪${formatNumber(summary.expectedIncome)}`,
      color: 'text-purple-600'
    },
    {
      title: 'סה"כ עלות אולם',
      value: `₪${formatNumber(summary.venueTotalCost)}`,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="relative">
      {/* אינדיקטורי שמירה עדינים */}
      {isSaving && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            שומר...
          </div>
        </div>
      )}
      
      {showSaveSuccess && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-bounce">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            נשמר!
          </div>
        </div>
      )}
      
    <div className="flex flex-wrap justify-center gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-6 min-w-[200px]">
          <div className={`text-2xl font-bold ${card.color}`}>
            {card.value}
          </div>
          <div className="text-gray-600">{card.title}</div>
        </div>
      ))}
      </div>
    </div>
  );
} 