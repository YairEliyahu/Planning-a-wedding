'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GuestlistPage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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

      if (user._id !== params.id) {
        console.log('User ID mismatch:', { userId: user._id, paramsId: params.id });
        router.push(`/user/${user._id}/guestlist`);
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  if (!isAuthReady || isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>טוען...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>רשימת אורחים</h1>
      <div style={styles.content}>
        <p style={styles.comingSoon}>
          בקרוב - ניהול רשימת האורחים שלך!
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  content: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  comingSoon: {
    textAlign: 'center' as const,
    fontSize: '1.2rem',
    color: '#666',
  },
  loadingSpinner: {
    fontSize: '1.5rem',
    textAlign: 'center' as const,
    color: '#666',
  },
};
