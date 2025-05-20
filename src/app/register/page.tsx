'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: '#FD5890' }}>הרשמה</h1>
        
        {hasInvitation && (
          <div className="bg-pink-50 p-4 rounded-md mb-6 border border-pink-200">
            <p className="text-pink-800 font-medium">התקבלה הזמנה לשיתוף ניהול חשבון חתונה!</p>
            <p className="text-pink-700 text-sm mt-1">אנא השלם את ההרשמה כדי להצטרף לחשבון המשותף.</p>
          </div>
        )}
        
        {error && <p className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</p>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="שם מלא *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />
          <input
            type="number"
            placeholder="גיל"
            value={age}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 120)) {
                setAge(value);
              }
            }}
            min="0"
            max="120"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">בחר מגדר</option>
            <option value="Male">זכר</option>
            <option value="Female">נקבה</option>
            <option value="Other">אחר</option>
          </select>
          
          <OSMPlacesAutocomplete 
            value={location}
            onChange={setLocation}
            onSelect={handleSelectPlace}
            placeholder="הזן מיקום מגורים"
          />
          
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="מספר טלפון (9 ספרות)"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              dir="ltr"
              maxLength={9}
            />
            <select
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
              className="w-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
              dir="ltr"
            >
              <option value="+972">+972</option>
              <option value="0">0</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="מספר תעודת זהות (9 ספרות)"
            value={idNumber}
            onChange={handleIdNumberChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
            maxLength={9}
          />
          <input
            type="email"
            placeholder="אימייל *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />
          <input
            type="password"
            placeholder="סיסמה * (לפחות 8 תווים)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
            minLength={8}
          />
          <button 
            type="submit" 
            className="w-full p-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-md transition-colors duration-200 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? 'מבצע רישום...' : 'הרשמה'}
          </button>
        </form>
      </div>
      
      {isLoading && <LoadingSpinner text="מבצע רישום..." color="pink" />}
    </div>
  );
};

export default RegisterPage;
