'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  weddingDate: string;
  partnerName: string;
  partnerPhone: string;
  expectedGuests: string;
  weddingLocation: string;
  budget: string;
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  authProvider?: string;
  profilePicture?: string;
}

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    weddingDate: '',
    partnerName: '',
    partnerPhone: '',
    expectedGuests: '',
    weddingLocation: '',
    budget: '',
    preferences: {
      venue: false,
      catering: false,
      photography: false,
      music: false,
      design: false,
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

      await fetchUserProfile();
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      if (!params.id) {
        throw new Error('No user ID provided');
      }

      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user data');
      
      const userData = data.user;
      setProfile(userData);

      // עיבוד התאריך לפורמט המתאים לשדה input מסוג date
      const formattedDate = userData.weddingDate 
        ? new Date(userData.weddingDate).toISOString().split('T')[0]
        : '';

      setFormData({
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        weddingDate: formattedDate,
        partnerName: userData.partnerName || '',
        partnerPhone: userData.partnerPhone || '',
        expectedGuests: userData.expectedGuests || '',
        weddingLocation: userData.weddingLocation || '',
        budget: userData.budget || '',
        preferences: {
          venue: Boolean(userData.preferences?.venue),
          catering: Boolean(userData.preferences?.catering),
          photography: Boolean(userData.preferences?.photography),
          music: Boolean(userData.preferences?.music),
          design: Boolean(userData.preferences?.design)
        }
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
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

  const handlePreferenceChange = (key: keyof typeof formData.preferences) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccessMessage('הפרופיל עודכן בהצלחה!');
      
      // הסרת ההודעה אחרי 3 שניות
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Update failed:', err);
      setError(err instanceof Error ? err.message : 'עדכון הפרופיל נכשל');
    }
  };

  if (!isAuthReady || isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>{error}</div>
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

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>עריכת פרופיל</h1>
        
        {successMessage && (
          <div style={styles.successMessage}>{successMessage}</div>
        )}
        
        {error && (
          <div style={styles.errorMessage}>{error}</div>
        )}

        {profile.authProvider === 'google' && profile.profilePicture && (
          <div style={styles.profileImageContainer}>
            <img 
              src={profile.profilePicture} 
              alt="Profile" 
              style={styles.profileImage}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.gridContainer}>
            {/* Personal Details Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>פרטים אישיים</h3>
              
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
                <label style={styles.label}>טלפון</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
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
            </div>

            {/* Wedding Details Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>פרטי החתונה</h3>
              
              <div style={styles.fieldContainer}>
                <label style={styles.label}>תאריך החתונה</label>
                <input
                  type="date"
                  name="weddingDate"
                  value={formData.weddingDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldContainer}>
                <label style={styles.label}>שם בן/בת הזוג</label>
                <input
                  type="text"
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldContainer}>
                <label style={styles.label}>טלפון בן/בת הזוג</label>
                <input
                  type="tel"
                  name="partnerPhone"
                  value={formData.partnerPhone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldContainer}>
                <label style={styles.label}>מספר אורחים משוער</label>
                <input
                  type="number"
                  name="expectedGuests"
                  value={formData.expectedGuests}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldContainer}>
                <label style={styles.label}>מיקום משוער</label>
                <input
                  type="text"
                  name="weddingLocation"
                  value={formData.weddingLocation}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldContainer}>
                <label style={styles.label}>תקציב משוער</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div style={styles.preferencesSection}>
            <h3 style={styles.sectionTitle}>שירותים נדרשים</h3>
            <div style={styles.preferencesGrid}>
              {Object.entries(formData.preferences).map(([key, value]) => (
                <label key={key} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handlePreferenceChange(key as keyof typeof formData.preferences)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>
                    {key === 'venue' && 'אולם אירועים'}
                    {key === 'catering' && 'קייטרינג'}
                    {key === 'photography' && 'צילום'}
                    {key === 'music' && 'מוזיקה'}
                    {key === 'design' && 'עיצוב'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" style={styles.submitButton}>
            שמור שינויים
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '2rem',
  },
  content: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  section: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: '#333',
    marginBottom: '1.5rem',
  },
  fieldContainer: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },
  preferencesSection: {
    marginTop: '2rem',
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
  },
  preferencesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  checkboxText: {
    fontSize: '0.9rem',
    color: '#666',
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
    width: '100%',
    marginTop: '2rem',
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
  loadingSpinner: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  profileImageContainer: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  profileImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '3px solid #0070f3',
  },
}; 