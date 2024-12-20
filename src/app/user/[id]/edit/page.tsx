'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  fullName: string;
  age: number;
  location: string;
  phone: string;
  email: string;
}

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const { user, updateUserData } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    location: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      setFormData({
        fullName: data.user.fullName,
        age: data.user.age.toString(),
        location: data.user.location,
        phone: data.user.phone,
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/user/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          age: parseInt(formData.age),
          location: formData.location,
          phone: formData.phone,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);

      // עדכון המידע ב-Context
      if (user) {
        updateUserData({ ...user, fullName: formData.fullName });
      }

      setSuccessMessage('הפרופיל עודכן בהצלחה!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update failed:', err);
      setError('עדכון הפרופיל נכשל');
    }
  };

  if (isLoading) return <div style={styles.container}>Loading...</div>;
  if (error) return <div style={styles.container}>Error: {error}</div>;
  if (!profile) return <div style={styles.container}>Profile not found</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>עריכת פרופיל</h1>
      
      {successMessage && (
        <div style={styles.successMessage}>{successMessage}</div>
      )}
      
      {error && (
        <div style={styles.errorMessage}>{error}</div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldContainer}>
          <label style={styles.label}>שם מלא</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.fieldContainer}>
          <label style={styles.label}>גיל</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.fieldContainer}>
          <label style={styles.label}>מקום מגורים</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.fieldContainer}>
          <label style={styles.label}>טלפון</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.fieldContainer}>
          <label style={styles.label}>אימייל</label>
          <input
            type="email"
            value={profile.email}
            style={{ ...styles.input, backgroundColor: '#f5f5f5' }}
            disabled
          />
        </div>

        <button type="submit" style={styles.submitButton}>
          שמור שינויים
        </button>
      </form>
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
  form: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  fieldContainer: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#0070f3',
    },
  },
  submitButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#0060df',
    },
    width: '100%',
    marginTop: '1rem',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
}; 