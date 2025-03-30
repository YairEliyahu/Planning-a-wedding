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
  estimatedBudget: string;
}

// קאש לנתונים - מונע בקשות חוזרות
const dataCache = new Map();

export default function MyWeddingPage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<WeddingPreferences>({
    venueType: '',
    timeOfDay: '',
    locationPreference: '',
    guestsCount: '',
    estimatedBudget: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savedPreferences, setSavedPreferences] = useState<WeddingPreferences | null>(null);
  const [error, setError] = useState('');

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
        // העדפות חתונה מהטבלה הנפרדת
        venueType: data?.preferences?.venueType || profileData.user.venueType || '',
        timeOfDay: data?.preferences?.timeOfDay || profileData.user.timeOfDay || '',
        locationPreference: data?.preferences?.locationPreference || profileData.user.locationPreference || '',
        // נתונים מפרופיל המשתמש
        guestsCount: profileData.user.expectedGuests || '',
        estimatedBudget: profileData.user.budget || '',
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
      
      // עדכון פרטי המשתמש (מספר אורחים ותקציב)
      const userResponse = await fetch(`/api/user/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expectedGuests: preferences.guestsCount,
          budget: preferences.estimatedBudget,
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
      <LoadingSpinner 
        text="טוען את הגדרות החתונה..." 
        size="large"
        fullScreen={true}
        color="pink"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error} <button className="underline ml-2" onClick={() => { setIsLoading(true); fetchProfileAndPreferences().finally(() => setIsLoading(false)); }}>נסה שוב</button>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">{getWeddingTitle()}</h1>
          
          {savedPreferences && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">סיכום העדפות החתונה שלכם:</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">{getPreferenceText(savedPreferences)}</p>
                  <p className="text-sm text-gray-500">מספר אורחים משוער: {savedPreferences.guestsCount}</p>
                  <p className="text-sm text-gray-500">תקציב משוער: ₪{Number(savedPreferences.estimatedBudget).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">העדפות חתונה</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">מיקום האירוע</label>
                  <select
                    name="venueType"
                    value={preferences.venueType}
                    onChange={handlePreferencesChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">בחרו את סוג המקום</option>
                    <option value="garden">גן אירועים</option>
                    <option value="nature">אירוע בטבע</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">שעת האירוע</label>
                  <select
                    name="timeOfDay"
                    value={preferences.timeOfDay}
                    onChange={handlePreferencesChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">בחרו את שעת האירוע</option>
                    <option value="evening">חתונת ערב</option>
                    <option value="afternoon">חתונת צהריים</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">אזור בארץ</label>
                  <select
                    name="locationPreference"
                    value={preferences.locationPreference}
                    onChange={handlePreferencesChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">בחרו את האזור המועדף</option>
                    <option value="south">דרום</option>
                    <option value="center">מרכז</option>
                    <option value="north">צפון</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">כמות מוזמנים משוערת</label>
                  <input
                    type="number"
                    name="guestsCount"
                    value={preferences.guestsCount}
                    onChange={handlePreferencesChange}
                    className="w-full p-2 border rounded"
                    placeholder="הכניסו מספר משוער של אורחים"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">תקציב משוער לחתונה</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="estimatedBudget"
                      value={preferences.estimatedBudget}
                      onChange={handlePreferencesChange}
                      className="w-full p-2 border rounded"
                      placeholder="הכניסו תקציב משוער"
                      required
                      min="0"
                      step="1000"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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