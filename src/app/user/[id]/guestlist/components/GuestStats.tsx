'use client';

import { useGuests } from '../context/GuestContext';

export function GuestStats() {
  const { stats } = useGuests();

  return (
    <>
      {/* סיכום סטטיסטי */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalCount}</div>
          <div className="text-gray-600 text-lg">סה&quot;כ הזמנות</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.confirmedCount}</div>
          <div className="text-gray-600 text-lg">הזמנות שאושרו</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.declinedCount}</div>
          <div className="text-gray-600 text-lg">הזמנות שנדחו</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-300">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingCount}</div>
          <div className="text-gray-600 text-lg">הזמנות בהמתנה</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 mb-10">
        <div className="text-2xl font-bold text-gray-800 mb-4 text-center">סיכום מספר האנשים</div>
        <div className="flex flex-col md:flex-row justify-between text-center gap-6">
          <div className="flex-1 p-4 bg-purple-50 rounded-xl">
            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.totalGuests}</div>
            <div className="text-gray-600 text-lg">סה&quot;כ אנשים שהוזמנו</div>
          </div>
          <div className="flex-1 p-4 bg-indigo-50 rounded-xl">
            <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.confirmedGuests}</div>
            <div className="text-gray-600 text-lg">אנשים שאישרו הגעה</div>
          </div>
        </div>
      </div>
    </>
  );
} 