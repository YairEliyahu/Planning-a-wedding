'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';

import QueryProvider from './providers/QueryProvider';
import { EditProfileProvider, useEditProfile } from './context/EditProfileContext';
import { styles } from './styles/formStyles';

// Components
import PersonalDetailsSection from './components/PersonalDetailsSection';
import WeddingDetailsSection from './components/WeddingDetailsSection';
import PreferencesSection from './components/PreferencesSection';
import ProfileImageSection from './components/ProfileImageSection';
import MessageDisplay from './components/MessageDisplay';

function EditProfileContent() {
  const { 
    profile, 
    isProfileLoading, 
    profileError, 
    updateProfile, 
    isUpdating,
    refetchProfile,
    clearMessages
  } = useEditProfile();

  if (isProfileLoading) {
    return (
      <LoadingSpinner 
        text="טוען את פרטי המשתמש..." 
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-500 text-xl font-bold mb-4">שגיאה בטעינת הנתונים</h2>
          <p className="text-gray-700 mb-6">{profileError.message}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => { 
                clearMessages();
                refetchProfile();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              נסה שנית
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>הפרופיל לא נמצא</div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    updateProfile();
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>עריכת פרופיל</h1>
          
          <MessageDisplay />
          <ProfileImageSection />

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.gridContainer}>
              <PersonalDetailsSection />
              <WeddingDetailsSection />
            </div>

            <PreferencesSection />

            <button type="submit" style={styles.button} disabled={isUpdating}>
              {isUpdating ? 'שומר...' : 'שמור שינויים'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function AuthGuard({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthReady) {
        console.log('Auth not ready yet');
        return;
      }

      console.log('Auth state:', { isAuthReady, user: user?._id });

      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      if (params.id !== user._id) {
        console.log('User ID mismatch:', { paramsId: params.id, userId: user._id });
        router.push(`/user/${user._id}/edit`);
        return;
      }
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  if (!isAuthReady) {
    return (
      <LoadingSpinner 
        text="מאמת זהות..." 
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  if (!user || params.id !== user._id) {
    return (
      <LoadingSpinner 
        text="מפנה..." 
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  return <>{children}</>;
}

export default function EditProfilePage({ params }: { params: { id: string } }) {
  return (
    <QueryProvider>
      <AuthGuard params={params}>
        <EditProfileProvider userId={params.id}>
          <EditProfileContent />
        </EditProfileProvider>
      </AuthGuard>
    </QueryProvider>
  );
} 