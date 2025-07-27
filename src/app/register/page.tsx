'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';
import OSMPlacesAutocomplete from '../components/OSMPlacesAutocomplete';
import { Place } from '../components/OSMPlacesAutocomplete';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [locationData, setLocationData] = useState<Place | null>(null);
  const [phonePrefix, setPhonePrefix] = useState('+972');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Check if there's an invitation token when the component loads
  const [hasInvitation, setHasInvitation] = useState(false);
  
  useEffect(() => {
    const invitationToken = localStorage.getItem('invitation_token');
    if (invitationToken) {
      setHasInvitation(true);
    }
  }, []);

  const validateIdNumber = (id: string): boolean => {
    const idRegex = /^[0-9]{9}$/;
    return idRegex.test(id);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // בדיקת שדות חובה
      if (!email || !password || !fullName) {
        throw new Error('אנא מלא את כל שדות החובה: אימייל, סיסמה ושם מלא');
      }

      // בדיקת תקינות גיל
      if (age && (parseInt(age) < 0 || parseInt(age) > 120)) {
        throw new Error('הגיל חייב להיות בין 0 ל-120');
      }

      // בדיקת תקינות מספר טלפון
      if (phoneNumber && phoneNumber.length !== 9) {
        throw new Error('מספר הטלפון חייב להכיל 9 ספרות');
      }

      // בדיקת תקינות תעודת זהות
      if (idNumber && !validateIdNumber(idNumber)) {
        throw new Error('מספר תעודת זהות חייב להכיל 9 ספרות');
      }

      // בדיקת חוזק סיסמה
      if (password.length < 8) {
        throw new Error('הסיסמה חייבת להכיל לפחות 8 תווים');
      }
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          age,
          gender,
          location,
          locationCoordinates: locationData ? {
            lat: locationData.lat,
            lon: locationData.lon
          } : null,
          phone: phoneNumber ? `${phonePrefix}${phoneNumber}` : '',
          idNumber,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // שומרים את הטוקן
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      // Check if there's a stored invitation token
      const invitationToken = localStorage.getItem('invitation_token');
      
      // מעבירים לדף הבית או לדף השלמת הפרופיל
      if (invitationToken) {
        router.push('/accept-invitation');
      } else if (data.user?.isProfileComplete) {
        router.push('/');
      } else {
        router.push('/complete-profile');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה בתהליך ההרשמה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlace = (place: Place) => {
    setLocationData(place);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // מאפשר רק ספרות
    if (/^[0-9]*$/.test(value) && value.length <= 9) {
      setPhoneNumber(value);
    }
  };

  const handleIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // מאפשר רק ספרות
    if (/^[0-9]*$/.test(value)) {
      setIdNumber(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-3 sm:p-4 lg:p-8">
      {/* מיכל ראשי עם responsive width */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-10">
        {/* כותרת */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#FD5890' }}>
            הרשמה
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            הצטרפו אלינו לתכנון החתונה המושלמת
          </p>
        </div>
        
        {/* הודעת הזמנה */}
        {hasInvitation && (
          <div className="bg-pink-50 border border-pink-200 p-4 sm:p-5 rounded-lg mb-6">
            <p className="text-pink-800 font-medium text-sm sm:text-base">
              התקבלה הזמנה לשיתוף ניהול חשבון חתונה!
            </p>
            <p className="text-pink-700 text-xs sm:text-sm mt-1">
              אנא השלם את ההרשמה כדי להצטרף לחשבון המשותף.
            </p>
          </div>
        )}
        
        {/* הודעת שגיאה */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {/* טופס הרשמה */}
        <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
          {/* שם מלא */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="fullName" className="block text-sm sm:text-base font-medium text-gray-700">
              שם מלא *
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="הכנס את השם המלא שלך"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-right text-base min-h-[48px] transition-all duration-200"
              dir="rtl"
              required
            />
          </div>

          {/* גיל */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="age" className="block text-sm sm:text-base font-medium text-gray-700">
              גיל
            </label>
            <input
              id="age"
              type="number"
              placeholder="גיל (אופציונלי)"
              value={age}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 120)) {
                  setAge(value);
                }
              }}
              min="0"
              max="120"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-right text-base min-h-[48px] transition-all duration-200"
              dir="rtl"
            />
          </div>

          {/* מגדר */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="gender" className="block text-sm sm:text-base font-medium text-gray-700">
              מגדר
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-right text-base min-h-[48px] transition-all duration-200 bg-white"
              dir="rtl"
            >
              <option value="">בחר מגדר (אופציונלי)</option>
              <option value="Male">זכר</option>
              <option value="Female">נקבה</option>
              <option value="Other">אחר</option>
            </select>
          </div>
          
          {/* מיקום */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="location" className="block text-sm sm:text-base font-medium text-gray-700">
              מיקום מגורים
            </label>
            <OSMPlacesAutocomplete 
              value={location}
              onChange={setLocation}
              onSelect={handleSelectPlace}
              placeholder="הזן מיקום מגורים (אופציונלי)"
            />
          </div>
          
          {/* טלפון */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="phoneNumber" className="block text-sm sm:text-base font-medium text-gray-700">
              מספר טלפון
            </label>
            <div className="flex gap-2 sm:gap-3">
              <input
                id="phoneNumber"
                type="tel"
                placeholder="מספר טלפון (9 ספרות)"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="flex-1 p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-base min-h-[48px] transition-all duration-200"
                dir="ltr"
                maxLength={9}
              />
              <select
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                className="w-20 sm:w-24 p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white text-base min-h-[48px] transition-all duration-200"
                dir="ltr"
              >
                <option value="+972">+972</option>
                <option value="0">0</option>
              </select>
            </div>
          </div>

          {/* תעודת זהות */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="idNumber" className="block text-sm sm:text-base font-medium text-gray-700">
              מספר תעודת זהות
            </label>
            <input
              id="idNumber"
              type="text"
              placeholder="מספר תעודת זהות (9 ספרות)"
              value={idNumber}
              onChange={handleIdNumberChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-right text-base min-h-[48px] transition-all duration-200"
              dir="rtl"
              maxLength={9}
            />
          </div>

          {/* אימייל */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700">
              אימייל *
            </label>
            <input
              id="email"
              type="email"
              placeholder="הכנס את כתובת המייל שלך"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-right text-base min-h-[48px] transition-all duration-200"
              dir="rtl"
              required
            />
          </div>

          {/* סיסמה */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700">
              סיסמה *
            </label>
            <input
              id="password"
              type="password"
              placeholder="סיסמה (לפחות 8 תווים)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-right text-base min-h-[48px] transition-all duration-200"
              dir="rtl"
              required
              minLength={8}
            />
          </div>

          {/* כפתור הרשמה */}
          <button 
            type="submit" 
            className="w-full p-3 sm:p-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-base sm:text-lg min-h-[48px] active:scale-[0.98] touch-manipulation mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                מבצע רישום...
              </div>
            ) : (
              'הרשמה'
            )}
          </button>
        </form>

        {/* קישור לכניסה */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="text-sm sm:text-base text-gray-600">
            כבר יש לך חשבון? {' '}
            <Link 
              href="/login" 
              className="text-pink-500 hover:text-pink-600 font-semibold transition-colors underline-offset-2 hover:underline"
            >
              התחבר כאן
            </Link>
          </div>
        </div>
      </div>
      
      {/* לוגו/מותג בתחתית */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-xs sm:text-sm text-gray-400">
          Wedding Planner - תכנון חתונות מקצועי
        </p>
      </div>
      
      {/* רכיב טעינה */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <LoadingSpinner text="מבצע רישום..." color="pink" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
