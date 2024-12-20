'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyWeddingPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>החתונה שלי</h1>
      <div style={styles.content}>
        {/* כאן יבוא תוכן עמוד החתונה */}
        <p style={styles.comingSoon}>
          בקרוב - ניהול החתונה שלך!
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
}; 