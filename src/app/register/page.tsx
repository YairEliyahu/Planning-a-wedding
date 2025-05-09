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
  const [phone, setPhone] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (!email || !password || !fullName) {
        throw new Error('אנא מלא את כל שדות החובה: אימייל, סיסמה ושם מלא');
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
          phone,
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
            onChange={(e) => setAge(e.target.value)}
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
          
          <input
            type="tel"
            placeholder="מספר טלפון"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-right"
            dir="rtl"
          />
          <input
            type="text"
            placeholder="מספר תעודת זהות"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
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
            placeholder="סיסמה *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
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
