'use client';

import { useChecklistContext } from '../context/ChecklistContext';

export default function ChecklistFilters() {
  const { filters, setFilter, setSortBy } = useChecklistContext();

  return (
    <div className="flex justify-center gap-4 mb-8">
      <select
        value={filters.filter}
        onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'pending')}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">כל המשימות</option>
        <option value="completed">הושלמו</option>
        <option value="pending">בהמתנה</option>
      </select>

      <select
        value={filters.sortBy}
        onChange={(e) => setSortBy(e.target.value as 'priority' | 'name' | 'budget')}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="priority">מיון לפי עדיפות</option>
        <option value="name">מיון לפי שם</option>
        <option value="budget">מיון לפי תקציב</option>
      </select>
    </div>
  );
} 