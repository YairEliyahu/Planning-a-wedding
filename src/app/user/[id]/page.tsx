'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
      }
      await fetchUserProfile();
    };

    checkAuth();
  }, [user, params.id]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setProfile(data.user);
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div style={styles.container}>Loading...</div>;
  if (error) return <div style={styles.container}>Error: {error}</div>;
  if (!profile) return <div style={styles.container}>Profile not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* כוכן חדש יתווסף כאן */}
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
  content: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '400px',
  },
}; 