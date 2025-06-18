'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  gender?: string;
  partnerName?: string;
  partnerGender?: string;
  weddingDate?: string;
  expectedGuests?: string;
  budget?: string;
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  locationPreference: 'south' | 'center' | 'north' | '';
  preferences?: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
}

interface WeddingPreferences {
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  locationPreference: 'south' | 'center' | 'north' | '';
  guestsCount: string;
}

// קאש לנתונים - מונע בקשות חוזרות
const dataCache = new Map();

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffe4ec 0%, #fff 60%, #ffe4ec 100%)',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  card: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px 0 rgba(245, 158, 158, 0.12)',
    border: '1.5px solid #fbcfe8',
    padding: '2.5rem 2rem',
    marginTop: '2rem',
    maxWidth: '540px',
    width: '100%',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 800,
    marginBottom: '2rem',
    background: 'linear-gradient(90deg, #f472b6 0%, #f9a8d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center',
    letterSpacing: '0.02em',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#be185d',
    marginBottom: '1.2rem',
    letterSpacing: '0.01em',
    textAlign: 'center',
  },
  label: {
    fontWeight: 500,
    color: '#be185d',
    fontSize: '1rem',
    marginBottom: '0.2rem',
    display: 'block',
  },
  input: {
    border: '1.5px solid #fbcfe8',
    borderRadius: '999px',
    padding: '0.7rem 1.2rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#fff',
    color: '#be185d',
    fontWeight: 500,
    boxShadow: '0 1px 4px 0 #fbcfe8',
    width: '100%',
  },
  select: {
    border: '1.5px solid #fbcfe8',
    borderRadius: '999px',
    padding: '0.7rem 1.2rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#fff',
    color: '#be185d',
    fontWeight: 500,
    boxShadow: '0 1px 4px 0 #fbcfe8',
    width: '100%',
  },
  button: {
    background: 'linear-gradient(90deg, #f472b6 0%, #f9a8d4 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    padding: '0.9rem 2.2rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px 0 #fbcfe8',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  buttonHover: {
    background: 'linear-gradient(90deg, #f472b6 0%, #be185d 100%)',
    boxShadow: '0 4px 16px 0 #fbcfe8',
    transform: 'scale(1.04)',
  },
  errorMessage: {
    background: 'linear-gradient(90deg, #fca5a5 0%, #fbcfe8 100%)',
    color: '#b91c1c',
    borderRadius: '999px',
    padding: '0.8rem 1.2rem',
    textAlign: 'center',
    fontWeight: 700,
    marginBottom: '1.2rem',
    fontSize: '1.1rem',
    border: '1.5px solid #fca5a5',
    boxShadow: '0 2px 8px 0 #fca5a5',
  },
};

export default function MyWeddingPage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<WeddingPreferences>({
    venueType: '',
    timeOfDay: '',
    locationPreference: '',
    guestsCount: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savedPreferences, setSavedPreferences] = useState<WeddingPreferences | null>(null);
  const [error, setError] = useState('');
  const [isButtonHover, setIsButtonHover] = useState(false);

  // פונקציה שמחזירה נתונים מהקאש או מבצעת בקשה חדשה
  const fetchWithCache = async (url: string, cacheKey: string) => {
    if (dataCache.has(cacheKey)) {
      return dataCache.get(cacheKey);
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      dataCache.set(cacheKey, data);
    }
    
    return data;
  };

  const fetchProfileAndPreferences = async () => {
    try {
      // קריאה לפרופיל המשתמש
      const profileResponse = await fetch(`/api/user/${params.id}`);
      const profileData = await profileResponse.json();
      
      console.log('Profile data:', profileData);
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      setProfile(profileData.user);
      
      // קריאה להעדפות החתונה
      const cacheKey = `wedding-preferences-${params.id}`;
      const data = await fetchWithCache(`/api/wedding-preferences/${params.id}`, cacheKey);
      
      console.log('Wedding preferences data:', data);
      
      // שילוב המידע מהפרופיל ומהעדפות החתונה
      const newPreferences = {
        venueType: data?.preferences?.venueType || profileData.user.venueType || '',
        timeOfDay: data?.preferences?.timeOfDay || profileData.user.timeOfDay || '',
        locationPreference: data?.preferences?.locationPreference || profileData.user.locationPreference || '',
        guestsCount: profileData.user.expectedGuests || '',
      };
      
      console.log('Combined preferences:', newPreferences);
      
      setPreferences(newPreferences);
      setSavedPreferences(newPreferences);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('אירעה שגיאה בטעינת העדפות החתונה');
    } finally {
      setIsLoading(false);
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

      await fetchProfileAndPreferences();
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  // רענון אוטומטי של נתוני החתונה אם המשתמש מחובר למשתמש אחר
  useEffect(() => {
    if (user && user.connectedUserId) {
      console.log(`User has connected account ${user.connectedUserId}, setting up auto-refresh for wedding data`);
      let autoRefreshInterval: NodeJS.Timeout;

      // רענון ראשוני
      const initialDelay = setTimeout(() => {
        console.log('Initial refresh of wedding data for connected accounts');
        dataCache.clear(); // ניקוי מטמון
        fetchProfileAndPreferences();

        // רענון כל 30 שניות
        autoRefreshInterval = setInterval(() => {
          console.log('Auto-refreshing wedding data for connected accounts...');
          // ניקוי המטמון לפני הרענון כדי לקבל תמיד את הנתונים העדכניים ביותר
          dataCache.clear();
          fetchProfileAndPreferences();
        }, 30000); // 30 seconds refresh
      }, 5000); // Initial delay of 5 seconds

      // ניקוי בעת עזיבת הקומפוננטה
      return () => {
        clearTimeout(initialDelay);
        clearInterval(autoRefreshInterval);
      };
    }
  }, [user]);

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Submitting preferences:', preferences);
      
      // עדכון פרטי המשתמש (מספר אורחים בלבד)
      const userResponse = await fetch(`/api/user/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expectedGuests: preferences.guestsCount,
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to update user profile');
      }

      const userResult = await userResponse.json();
      console.log('User update result:', userResult);

      // עדכון העדפות החתונה (מיקום, שעה ואזור)
      const preferencesResponse = await fetch(`/api/wedding-preferences/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venueType: preferences.venueType,
          timeOfDay: preferences.timeOfDay,
          locationPreference: preferences.locationPreference,
        }),
      });
      
      if (!preferencesResponse.ok) {
        throw new Error('Failed to update wedding preferences');
      }

      const preferencesResult = await preferencesResponse.json();
      console.log('Preferences update result:', preferencesResult);
      
      // עדכון המצב המקומי
      setSavedPreferences(preferences);
      
      // טעינה מחדש של הנתונים מהשרת
      await fetchProfileAndPreferences();
      
      alert('העדפות החתונה נשמרו בהצלחה!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setError('שגיאה בשמירת העדפות החתונה');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthReady || isLoading) {
    return (
      <div style={styles.page as React.CSSProperties}>
        <LoadingSpinner 
          text="טוען את הגדרות החתונה..." 
          size="large"
          fullScreen={false}
          color="pink"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page as React.CSSProperties}>
        <div style={styles.errorMessage as React.CSSProperties}>
          {error} <button style={{...styles.button, padding: '0.4rem 1.2rem', fontSize: '1rem'}} onClick={() => { setIsLoading(true); fetchProfileAndPreferences().finally(() => setIsLoading(false)); }}>נסה שוב</button>
        </div>
      </div>
    );
  }

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
    const location = preferences.locationPreference ? locations[preferences.locationPreference] : '';

    if (!venue && !time && !location) {
      return 'טרם נבחרו העדפות';
    }

    return `${venue} ${time} ${location}`.trim();
  };

  return (
    <div style={styles.page as React.CSSProperties}>
      <Navbar />
      <main style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0'}}>
        <div style={styles.card as React.CSSProperties}>
          <h1 style={styles.title as React.CSSProperties}>{getWeddingTitle()}</h1>
          {savedPreferences && (
            <div style={{
              ...styles.card,
              marginTop: 0,
              marginBottom: '2rem',
              background: 'rgba(255,255,255,0.85)',
            }}>
              <h2 style={styles.sectionTitle as React.CSSProperties}>סיכום העדפות החתונה שלכם:</h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <p style={{fontWeight: 600, color: '#be185d'}}>{getPreferenceText(savedPreferences)}</p>
                <p style={{fontSize: '1rem', color: '#be185d'}}>מספר אורחים משוער: {savedPreferences.guestsCount}</p>
              </div>
            </div>
          )}

          <div>
            <h2 style={styles.sectionTitle as React.CSSProperties}>העדפות חתונה</h2>
            <form onSubmit={handleSubmit}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem'}}>
                <div>
                  <label htmlFor="venueType" style={styles.label as React.CSSProperties}>מיקום האירוע</label>
                  <select
                    id="venueType"
                    name="venueType"
                    value={preferences.venueType}
                    onChange={handlePreferencesChange}
                    style={styles.select as React.CSSProperties}
                    required
                  >
                    <option value="">בחרו את סוג המקום</option>
                    <option value="garden">גן אירועים</option>
                    <option value="nature">אירוע בטבע</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timeOfDay" style={styles.label as React.CSSProperties}>שעת האירוע</label>
                  <select
                    id="timeOfDay"
                    name="timeOfDay"
                    value={preferences.timeOfDay}
                    onChange={handlePreferencesChange}
                    style={styles.select as React.CSSProperties}
                    required
                  >
                    <option value="">בחרו את שעת האירוע</option>
                    <option value="evening">חתונת ערב</option>
                    <option value="afternoon">חתונת צהריים</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="locationPreference" style={styles.label as React.CSSProperties}>אזור בארץ</label>
                  <select
                    id="locationPreference"
                    name="locationPreference"
                    value={preferences.locationPreference}
                    onChange={handlePreferencesChange}
                    style={styles.select as React.CSSProperties}
                    required
                  >
                    <option value="">בחרו את האזור המועדף</option>
                    <option value="south">דרום</option>
                    <option value="center">מרכז</option>
                    <option value="north">צפון</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="guestsCount" style={styles.label as React.CSSProperties}>כמות מוזמנים משוערת</label>
                  <input
                    id="guestsCount"
                    type="number"
                    name="guestsCount"
                    value={preferences.guestsCount}
                    onChange={handlePreferencesChange}
                    style={styles.input as React.CSSProperties}
                    placeholder="הכניסו מספר משוער של אורחים"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <button
                  type="submit"
                  style={{
                    ...(styles.button as React.CSSProperties),
                    ...(isButtonHover ? styles.buttonHover : {}),
                  }}
                  onMouseEnter={() => setIsButtonHover(true)}
                  onMouseLeave={() => setIsButtonHover(false)}
                  disabled={isLoading}
                >
                  {isLoading ? 'שומר העדפות...' : 'שמירת העדפות'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 