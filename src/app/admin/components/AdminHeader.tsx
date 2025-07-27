'use client';

import { useAdmin } from '../context/AdminContext';

export default function AdminHeader() {
  const { logout } = useAdmin();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">פאנל ניהול אדמין</h1>
            <p className="text-gray-600">ניהול משתמשים ונתוני המערכת</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              מחובר כאדמין
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              התנתק
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 