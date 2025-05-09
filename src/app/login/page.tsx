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
      
      // שלבי תהליך עם הודעות מתאימות
      const stages = [
        { time: 1000, message: 'מאמת פרטים...' },
        { time: 3000, message: 'מתחבר למסד הנתונים...' },
        { time: 6000, message: 'מחפש חשבון משתמש...' },
        { time: 10000, message: 'מכין נתוני התחברות...' },
        { time: 15000, message: 'מכין את האפליקציה...' },
        { time: 20000, message: 'כמעט שם...' },
        { time: 30000, message: 'ממתין לסיום ההתחברות...' }
      ];
      
      // הגדרת התקדמות עבור כל שלב
      stages.forEach(stage => {
        setTimeout(() => {
          if (isGoogleLoading) { // בדיקה שעדיין בתהליך טעינה
            setLoadingMessage(stage.message);
          }
        }, stage.time);
      });
      
      // טיימר אבטחה - אם לא הסתיים תוך 40 שניות, בטל
      timer = setTimeout(() => {
        if (isGoogleLoading) {
          setIsGoogleLoading(false);
          setError('ההתחברות לקחה יותר מדי זמן. נסה שנית.');
        }
      }, 40000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isGoogleLoading]);

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
    setIsGoogleLoading(true);
    setError('');
    // הניווט מתבצע במקביל להצגת מחוון ההתקדמות
    window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = async () => {
    window.location.href = '/api/auth/facebook';
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
          className="w-full p-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-md mb-3 transition-colors duration-200 hover:bg-gray-50 flex justify-center items-center"
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? 'מתחבר לגוגל...' : 'התחבר עם Google'}
        </button>

        <button 
          onClick={handleFacebookLogin} 
          className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 flex justify-center items-center"
          disabled={isLoading || isGoogleLoading}
        >
          התחבר עם Facebook
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
