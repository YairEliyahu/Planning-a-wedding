'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import EditableField from '@/components/EditableField';

interface UserProfile {
  _id: string;
  fullName: string;
  age: number;
  location: string;
  phone: string;
  email: string;
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchUserProfile();
  }, [user, params.id]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setProfile(data.user);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (field: keyof UserProfile, value: string | number) => {
    try {
      const response = await fetch(`/api/user/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);

      setProfile(prev => prev ? { ...prev, [field]: value } : null);
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update profile');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>הפרופיל שלי</h1>
      
      <div style={styles.profileGrid}>
        <EditableField
          label="שם מלא"
          value={profile.fullName}
          onSave={(value) => handleUpdate('fullName', value)}
          fieldName="fullName"
        />

        <EditableField
          label="גיל"
          value={profile.age}
          type="number"
          onSave={(value) => handleUpdate('age', parseInt(value))}
          fieldName="age"
        />

        <EditableField
          label="מקום מגורים"
          value={profile.location}
          onSave={(value) => handleUpdate('location', value)}
          fieldName="location"
        />

        <EditableField
          label="טלפון"
          value={profile.phone}
          onSave={(value) => handleUpdate('phone', value)}
          fieldName="phone"
        />

        <div style={styles.fieldContainer}>
          <span style={styles.label}>אימייל</span>
          <span style={styles.value}>{profile.email}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '80px auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  profileGrid: {
    display: 'grid',
    gap: '2rem',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: '1.1rem',
    color: '#333',
  },
}; 