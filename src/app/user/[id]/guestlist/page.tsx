'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Button } from '@/components/ui/button';

// Context and Providers
import { QueryProvider } from './providers/QueryProvider';
import { GuestProvider } from './context/GuestContext';

// Components
import { GuestStats } from './components/GuestStats';
import { GuestFilters } from './components/GuestFilters';
import { GuestTable } from './components/GuestTable';
import { AddGuestForm } from './components/AddGuestForm';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ImportStatusMessage } from './components/ImportStatusMessage';
import { ConnectedAccountAlert } from './components/ConnectedAccountAlert';

interface GuestlistPageContentProps {
  userId: string;
}

function GuestlistPageContent({ userId: _userId }: GuestlistPageContentProps) {
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ 
    current: 0, 
    total: 0, 
    currentName: '' 
  });
  const [importStatus, setImportStatus] = useState<{
    success: number;
    error: number;
    errorDetails?: {
      missingName?: number;
      invalidPhone?: number;
      apiErrors?: number;
      otherErrors?: number;
    };
  } | null>(null);
  const [showImportStatus, setShowImportStatus] = useState(false);

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportStatus(null);
    setImportProgress({ current: 0, total: 0, currentName: '' });

    try {
      // Here we would integrate with the guestService.importGuests
      // For now, we'll simulate the import process
      // In a real implementation, this would be handled by the context
      console.log('Starting import for file:', file.name);
      
      // Mock progress updates
      setImportProgress({ current: 1, total: 10, currentName: 'דוגמה...' });
      
      // This would be replaced with actual import logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setImportStatus({
        success: 8,
        error: 2,
        errorDetails: {
          missingName: 1,
          apiErrors: 1,
          invalidPhone: 0,
          otherErrors: 0
        }
      });
      setShowImportStatus(true);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus({
        success: 0,
        error: 1,
        errorDetails: { otherErrors: 1 }
      });
      setShowImportStatus(true);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Head>
        <link 
          href="https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
        <style>{`
          body {
            font-family: 'M PLUS 1p', sans-serif;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Head>
      
      <Navbar />
      
      {/* Loading overlay for import */}
      <LoadingOverlay 
        isVisible={isImporting} 
        progress={importProgress}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-2xl font-bold tracking-tight">ניהול רשימת מוזמנים</h1>
              <Button onClick={() => setIsAddingGuest(!isAddingGuest)}>
                {isAddingGuest ? 'ביטול' : 'הוספת מוזמן חדש'}
              </Button>
            </div>
            
            {/* Connected account alert */}
            <ConnectedAccountAlert />
          </div>
          
          {/* Statistics */}
          <GuestStats />
          
          {/* Filters and actions */}
          <GuestFilters 
            onAddGuest={() => setIsAddingGuest(true)}
            onImport={handleImport}
          />

          {/* Add guest form */}
          <AddGuestForm
            isVisible={isAddingGuest}
            onClose={() => setIsAddingGuest(false)}
            hasExistingGuests={true} // This would come from context
          />

          {/* Guest table */}
          <GuestTable 
            onAddGuest={() => setIsAddingGuest(true)}
          />
        </div>
      </div>

      {/* Import status message */}
      <ImportStatusMessage
        isVisible={showImportStatus}
        onClose={() => setShowImportStatus(false)}
        status={importStatus}
      />
    </>
  );
}

export default function GuestlistPage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!user) {
        router.push('/login');
        return;
      }

      if (user._id !== params.id) {
        router.push(`/user/${user._id}/guestlist`);
        return;
      }

      // Check if profile is complete
      try {
        const response = await fetch(`/api/user/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.user.isProfileComplete) {
            router.push('/complete-profile');
            return;
          }
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        setError('שגיאה בטעינת פרופיל המשתמש');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  if (!isAuthReady || isLoading) {
    return (
      <LoadingSpinner 
        text="טוען את רשימת האורחים..." 
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-500 text-xl font-bold mb-4">שגיאה בטעינת הנתונים</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              נסה שנית
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryProvider>
      <GuestProvider userId={params.id}>
        <GuestlistPageContent userId={params.id} />
      </GuestProvider>
    </QueryProvider>
  );
} 