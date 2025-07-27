'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '../../../components/LoadingSpinner';

// Providers and Context
import { QueryProvider } from './providers/QueryProvider';
import { ChecklistProvider, useChecklistContext } from './context/ChecklistContext';

// Components
import SummaryCards from './components/SummaryCards';
import ChecklistChart from './components/ChecklistChart';
import ChecklistFilters from './components/ChecklistFilters';
import ChecklistCategory from './components/ChecklistCategory';
import ResetButton from './components/ResetButton';

// Main page content component
function ChecklistPageContent({ userId: _userId }: { userId: string }) {
  const { categories, isLoading, error } = useChecklistContext();

  // רק טעינה ראשונית מציגה מסך מלא
  if (isLoading && (!categories || categories.length === 0)) {
    return (
      <LoadingSpinner 
        text="טוען את הצ'קליסט..." 
        size="large"
        fullScreen={true}
        color="pink"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error} 
          <button 
            className="underline ml-2" 
            onClick={() => window.location.reload()}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20">
        <ResetButton />

        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">צ&apos;קליסט חתונה</h1>
            <p className="text-gray-600 text-lg mb-4">עקבו אחר המשימות והתקציב שלכם בדרך לחתונה המושלמת</p>
            
            <SummaryCards />
            <ChecklistChart />
            <ChecklistFilters />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(categories) && categories.map((category) => (
              <ChecklistCategory key={category.name} category={category} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Auth wrapper component
function ChecklistPageWithAuth({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

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
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  // Show loading while checking auth
  if (!isAuthReady) {
    return (
      <LoadingSpinner 
        text="מאמת הרשאות..." 
        size="large"
        fullScreen={true}
        color="pink"
      />
    );
  }

  // Don't render if auth check fails
  if (!user || user._id !== params.id) {
    return null;
  }

  return (
    <QueryProvider>
      <ChecklistProvider userId={params.id}>
        <ChecklistPageContent userId={params.id} />
      </ChecklistProvider>
    </QueryProvider>
  );
}

// Main export
export default function ChecklistPage({ params }: { params: { id: string } }) {
  return <ChecklistPageWithAuth params={params} />;
}