'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface UserProfile {
  fullName: string;
  gender: 'male' | 'female';
  partnerName: string;
  partnerGender: 'male' | 'female';
}

interface WeddingPreferences {
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  location: 'south' | 'center' | 'north' | '';
  guestsCount: string;
  estimatedBudget: string;
}

export default function MyWeddingPage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<WeddingPreferences>({
    venueType: '',
    timeOfDay: '',
    location: '',
    guestsCount: '',
    estimatedBudget: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savedPreferences, setSavedPreferences] = useState<WeddingPreferences | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`/api/wedding-preferences/${params.id}`);
      const data = await response.json();
      if (response.ok && data.preferences) {
        setSavedPreferences(data.preferences);
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

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
        router.push(`/user/${user._id}/wedding`);
        return;
      }

      await Promise.all([
        fetchProfile(),
        fetchPreferences()
      ]);
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/wedding-preferences/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      if (response.ok) {
        setSavedPreferences(preferences);
        alert('העדפות החתונה נשמרו בהצלחה!');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('שגיאה בשמירת ההעדפות');
    }
  };

  if (!user || isLoading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    </>
  );

  const getWeddingTitle = () => {
    if (!profile) return '';
    return `החתונה של ${profile.fullName} ו${profile.partnerName}`;
  };

  const getPreferenceText = (preferences: WeddingPreferences) => {
    const venueTypes = { garden: 'גן אירועים', nature: 'אירוע בטבע' };
    const times = { evening: 'בשעות הערב', afternoon: 'בשעות הצהריים' };
    const locations = { south: 'בדרום', center: 'במרכז', north: 'בצפון' };

    const venue = preferences.venueType ? venueTypes[preferences.venueType] : '';
    const time = preferences.timeOfDay ? times[preferences.timeOfDay] : '';
    const location = preferences.location ? locations[preferences.location] : '';

    if (!venue && !time && !location) {
      return 'טרם נבחרו העדפות';
    }

    return `${venue} ${time} ${location}`.trim();
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>{getWeddingTitle()}</h1>
        
        {savedPreferences && (
          <div style={styles.preferencesOverview}>
            <h2 style={styles.overviewTitle}>סיכום העדפות החתונה שלכם:</h2>
            <div style={styles.preferencesCard}>
              <p style={styles.preferencesText}>{getPreferenceText(savedPreferences)}</p>
              <p style={styles.preferencesDetails}>
                מספר אורחים משוער: {savedPreferences.guestsCount}
              </p>
              <p style={styles.preferencesDetails}>
                תקציב משוער: ₪{Number(savedPreferences.estimatedBudget).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div style={styles.content}>
          <p style={styles.welcomeText}>
            בשביל להפיק את חתונת החלומות שלכם, בואו נבין מה הייתם רוצים שיהיה לכם בחתונה ואיך היא תראה
          </p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>מיקום האירוע</label>
              <select
                name="venueType"
                value={preferences.venueType}
                onChange={handlePreferencesChange}
                style={styles.select}
                required
              >
                <option value="">בחרו את סוג המקום</option>
                <option value="garden">גן אירועים</option>
                <option value="nature">אירוע בטבע</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>שעת האירוע</label>
              <select
                name="timeOfDay"
                value={preferences.timeOfDay}
                onChange={handlePreferencesChange}
                style={styles.select}
                required
              >
                <option value="">בחרו את שעת האירוע</option>
                <option value="evening">חתונת ערב</option>
                <option value="afternoon">חתונת צהריים</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>אזור בארץ</label>
              <select
                name="location"
                value={preferences.location}
                onChange={handlePreferencesChange}
                style={styles.select}
                required
              >
                <option value="">בחרו את האזור המועדף</option>
                <option value="south">דרום</option>
                <option value="center">מרכז</option>
                <option value="north">צפון</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>כמות מוזמנים משוערת</label>
              <input
                type="number"
                name="guestsCount"
                value={preferences.guestsCount}
                onChange={handlePreferencesChange}
                style={styles.input}
                placeholder="הכניסו מספר משוער של אורחים"
                required
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>תקציב משוער לחתונה</label>
              <div style={styles.budgetInputWrapper}>
                <input
                  type="number"
                  name="estimatedBudget"
                  value={preferences.estimatedBudget}
                  onChange={handlePreferencesChange}
                  style={styles.input}
                  placeholder="הכניסו תקציב משוער"
                  required
                  min="0"
                  step="1000"
                />
                <span style={styles.currencySymbol}>₪</span>
              </div>
              <p style={styles.helperText}>
                *התקציב צריך לכלול: אולם, קייטרינג, צלם, תקליטן, שמלה, חליפה, טבעות, ושאר הספקים
              </p>
            </div>

            <button type="submit" style={styles.submitButton}>
              שמור העדפות
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '20px auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '2rem',
    textAlign: 'center' as const,
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  welcomeText: {
    fontSize: '1.2rem',
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  planningSection: {
    marginTop: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '1.1rem',
    color: '#333',
    fontWeight: '500',
  },
  select: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  input: {
    padding: '0.75rem',
    paddingRight: '30px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '1rem',
  },
  budgetInputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute' as const,
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    fontSize: '1rem',
  },
  helperText: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '0.5rem',
    fontStyle: 'italic',
  },
  preferencesOverview: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  overviewTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  preferencesCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  preferencesText: {
    fontSize: '1.2rem',
    color: '#0070f3',
    textAlign: 'center' as const,
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  preferencesDetails: {
    fontSize: '1.1rem',
    color: '#666',
    textAlign: 'center' as const,
    marginTop: '0.5rem',
  },
}; 