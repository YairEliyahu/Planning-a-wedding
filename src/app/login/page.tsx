'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // בדיקת פרמטרים של הכתובת בטעינת העמוד
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setLoadingMessage('');
      setIsGoogleLoading(false);
      
      // תרגום קודי שגיאה להודעות ידידותיות
      const errorMessages: Record<string, string> = {
        'MissingGoogleConfig': 'חסרות הגדרות לחיבור עם גוגל',
        'NoCode': 'לא התקבל קוד אימות מגוגל',
        'NoEmail': 'לא התקבל מייל מחשבון הגוגל',
        'CallbackFailed': 'שגיאה בתהליך התחברות עם גוגל',
        'GoogleAuthInitFailed': 'לא ניתן להתחיל תהליך התחברות עם גוגל'
      };
      
      setError(errorMessages[errorParam] || 'שגיאה בהתחברות');
    }
  }, [searchParams]);

  // הגדרת אנימציית טעינה בעת התחברות עם גוגל
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isGoogleLoading) {
      // התחלת אנימציית התקדמות
      setLoadingMessage('מתחבר לשירותי גוגל...');
      
      // שלבי תהליך עם הודעות מתאימות - מצומצם ומהיר יותר
      const stages = [
        { time: 1000, message: 'מאמת פרטים...' },
        { time: 3000, message: 'מתחבר למסד הנתונים...' },
        { time: 5000, message: 'מחפש חשבון משתמש...' },
        { time: 8000, message: 'ממתין לתשובה מגוגל...' }
      ];
      
      // הגדרת התקדמות עבור כל שלב
      stages.forEach(stage => {
        setTimeout(() => {
          if (isGoogleLoading) { // בדיקה שעדיין בתהליך טעינה
            setLoadingMessage(stage.message);
          }
        }, stage.time);
      });
      
      // טיימר אבטחה - הקטנת זמן ההמתנה ל-15 שניות במקום 40
      timer = setTimeout(() => {
        if (isGoogleLoading) {
          setIsGoogleLoading(false);
          setError('ההתחברות לקחה יותר מדי זמן. נסה שנית.');
        }
      }, 15000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isGoogleLoading]);

  // בדיקת זמן התחברות ארוך מדי עם גוגל
  useEffect(() => {
    const authStarted = localStorage.getItem('google_auth_started');
    
    if (authStarted) {
      const startTime = parseInt(authStarted);
      const elapsedTime = Date.now() - startTime;
      
      // אם עברו יותר מ-30 שניות מאז שהתחלנו את תהליך האימות, נקה את המצב
      if (elapsedTime > 30000) {
        setIsGoogleLoading(false);
        localStorage.removeItem('google_auth_started');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      await login(data.token, data.user);
      
      // Check if there's a stored invitation token
      const invitationToken = localStorage.getItem('invitation_token');
      const returnUrl = searchParams.get('returnUrl');
      
      if (invitationToken && returnUrl === '/accept-invitation') {
        router.push('/accept-invitation');
      } else {
        router.push(`/user/${data.user._id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהתחברות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // איפוס הודעות שגיאה
    setError('');
    
    // אחסון ברירת מחדל עבור חזרה מגוגל
    localStorage.setItem('google_auth_started', Date.now().toString());
    
    // הגדרת עמוד לוגין
    setIsGoogleLoading(true);
    
    // העברה מידית לדף גוגל
    window.location.href = '/api/auth/google';
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: '#FD5890' }}>התחברות</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-center">{error}</div>}
        
        {isGoogleLoading && (
          <LoadingSpinner text={loadingMessage} color="pink" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-right"
              dir="rtl"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-right"
              dir="rtl"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full p-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-md transition-colors duration-200 disabled:opacity-70"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        {isLoading && <LoadingSpinner text="מתחבר..." color="pink" />}

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">או</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="w-full p-3 border border-gray-200 bg-white text-gray-700 font-medium rounded-lg mb-3 transition-all duration-300 hover:bg-gray-50 hover:shadow-md hover:border-gray-300 flex justify-center items-center gap-3 group"
          disabled={isLoading || isGoogleLoading}
        >
          <svg 
            className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
            viewBox="0 0 24 24"
          >
            <path 
              fill="#4285F4" 
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path 
              fill="#34A853" 
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path 
              fill="#FBBC05" 
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path 
              fill="#EA4335" 
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-gray-600 font-medium">
            {isGoogleLoading ? 'מתחבר לגוגל...' : 'התחבר עם Google'}
          </span>
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          עדיין אין לך חשבון?{' '}
          <Link href="/register" className="text-pink-500 font-medium hover:text-pink-600">
            הירשם עכשיו
          </Link>
        </p>
      </div>
    </div>
  );
}
