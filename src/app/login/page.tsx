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

      if (!response.ok) {
        // בדיקה אם זה משתמש Google שיכול להגדיר סיסמה
        if (data.action === 'USE_GOOGLE_OR_SET_PASSWORD') {
          const confirmSetPassword = window.confirm(
            `${data.message}\n\nהאם תרצה להגדיר סיסמה כדי להתחבר גם בלי Google?`
          );
          
          if (confirmSetPassword) {
            router.push(`/set-password?email=${encodeURIComponent(data.email)}`);
            return;
          }
        }
        
        throw new Error(data.message);
      }

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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-3 sm:p-4 lg:p-8">
      {/* מיכל ראשי עם responsive width */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-10">
        {/* כותרת */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#FD5890' }}>
            התחברות
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            ברוכים השבים לתכנון החתונה שלכם
          </p>
        </div>
        
        {/* הודעת שגיאה */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-center text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {/* מצב טעינה של Google */}
        {isGoogleLoading && (
          <div className="mb-6">
            <LoadingSpinner text={loadingMessage} color="pink" />
          </div>
        )}

        {/* טופס התחברות */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-right text-base min-h-[48px] transition-all duration-200"
              dir="rtl"
              placeholder="הכנס את כתובת המייל שלך"
              required
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-right text-base min-h-[48px] transition-all duration-200"
              dir="rtl"
              placeholder="הכנס את הסיסמה שלך"
              required
            />
          </div>

          {/* כפתור התחברות */}
          <button 
            type="submit" 
            className="w-full p-3 sm:p-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-base sm:text-lg min-h-[48px] active:scale-[0.98] touch-manipulation"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                מתחבר...
              </div>
            ) : (
              'התחבר'
            )}
          </button>

          {/* מפריד */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 sm:px-4 bg-white text-gray-500">או</span>
            </div>
          </div>

          {/* כפתור Google */}
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full p-3 sm:p-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base sm:text-lg min-h-[48px] active:scale-[0.98] touch-manipulation"
            disabled={isLoading || isGoogleLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isGoogleLoading ? 'מתחבר עם Google...' : 'התחבר עם Google'}
          </button>
        </form>

        {/* קישורים נוספים */}
        <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
          <div className="text-sm sm:text-base text-gray-600">
            עדיין לא רשום? {' '}
            <Link 
              href="/register" 
              className="text-pink-500 hover:text-pink-600 font-semibold transition-colors underline-offset-2 hover:underline"
            >
              הירשם כאן
            </Link>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-500">
            יש בעיה בהתחברות? {' '}
            <Link 
              href="#" 
              className="text-pink-400 hover:text-pink-500 transition-colors underline-offset-2 hover:underline"
            >
              צור קשר לתמיכה
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
    </div>
  );
}
