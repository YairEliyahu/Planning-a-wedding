'use client';

import { useChecklistContext } from '../context/ChecklistContext';
import { formatNumber } from '../utils/checklistUtils';

export default function SummaryCards() {
  const { summary } = useChecklistContext();

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
  );
} 