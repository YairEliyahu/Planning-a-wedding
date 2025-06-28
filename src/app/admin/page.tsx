// src/app/admin/page.tsx
'use client';

import QueryProvider from './providers/QueryProvider';
import { AdminProvider, useAdmin } from './context/AdminContext';
import AdminLogin from './components/AdminLogin';
import AdminHeader from './components/AdminHeader';
import UserStats from './components/UserStats';
import UserTable from './components/UserTable';

function AdminDashboard() {
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserStats />
        <UserTable />
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <QueryProvider>
      <AdminProvider>
        <AdminDashboard />
      </AdminProvider>
    </QueryProvider>
  );
}
  