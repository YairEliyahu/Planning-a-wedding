'use client';

import React from 'react';
import { Table, Guest } from '../types';

interface StatisticsProps {
  tables: Table[];
  unassignedGuests: Guest[];
}

export default function Statistics({ tables, unassignedGuests }: StatisticsProps) {
  const totalSeatedGuests = tables.reduce((sum, table) => 
    sum + table.guests.reduce((guestSum, guest) => guestSum + guest.numberOfGuests, 0), 0
  );

  const confirmedButUnassigned = unassignedGuests.filter(g => g.isConfirmed === true).length;
  const declined = unassignedGuests.filter(g => g.isConfirmed === false).length;
  const pending = unassignedGuests.filter(g => g.isConfirmed === null).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{tables.length}</div>
        <div className="text-gray-600 font-[var(--font-heebo)]">שולחנות</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{totalSeatedGuests}</div>
        <div className="text-gray-600 font-[var(--font-heebo)]">אורחים מושבים</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-orange-600">{confirmedButUnassigned}</div>
        <div className="text-gray-600 font-[var(--font-heebo)]">מאושרים ללא שולחן</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{declined}</div>
        <div className="text-gray-600 font-[var(--font-heebo)]">סירבו</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">{pending}</div>
        <div className="text-gray-600 font-[var(--font-heebo)]">ממתינים לתשובה</div>
      </div>
    </div>
  );
} 