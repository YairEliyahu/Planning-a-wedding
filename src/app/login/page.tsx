'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // בדיקת פרמטרים של הכתובת בטעינת העמוד
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setLoadingMessage('');
      setLoadingProgress(0);
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
      setLoadingProgress(5);
      setLoadingMessage('מתחבר לשירותי גוגל...');
      
      // שלבי תהליך עם הודעות מתאימות
      const stages = [
        { time: 1000, progress: 10, message: 'מאמת פרטים...' },
        { time: 3000, progress: 15, message: 'מתחבר למסד הנתונים...' },
        { time: 6000, progress: 25, message: 'מחפש חשבון משתמש...' },
        { time: 10000, progress: 40, message: 'מכין נתוני התחברות...' },
        { time: 15000, progress: 60, message: 'מכין את האפליקציה...' },
        { time: 20000, progress: 80, message: 'כמעט שם...' },
        { time: 30000, progress: 90, message: 'ממתין לסיום ההתחברות...' }
      ];
      
      // הגדרת התקדמות עבור כל שלב
      stages.forEach(stage => {
        setTimeout(() => {
          if (isGoogleLoading) { // בדיקה שעדיין בתהליך טעינה
            setLoadingProgress(stage.progress);
            setLoadingMessage(stage.message);
          }
        }, stage.time);
      });
      
      // טיימר אבטחה - אם לא הסתיים תוך 40 שניות, בטל
      timer = setTimeout(() => {
        if (isGoogleLoading) {
          setIsGoogleLoading(false);
          setLoadingProgress(0);
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
      router.push(`/user/${data.user._id}`);
    } catch (err: any) {
      setError(err.message || 'שגיאה בהתחברות');
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
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h1 style={styles.title}>התחברות</h1>
        
        {error && <div style={styles.error}>{error}</div>}
        
        {isGoogleLoading && (
          <div style={styles.loadingContainer}>
            <div style={styles.progressBarOuter}>
              <div 
                style={{
                  ...styles.progressBarInner,
                  width: `${loadingProgress}%`
                }}
              />
            </div>
            <div style={styles.loadingMessage}>{loadingMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>אימייל</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>סיסמה</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>או</span>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          style={{ ...styles.socialButton, ...styles.googleButton }}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? 'מתחבר לגוגל...' : 'התחבר עם Google'}
        </button>

        <button 
          onClick={handleFacebookLogin} 
          style={{ ...styles.socialButton, ...styles.facebookButton }}
          disabled={isLoading || isGoogleLoading}
        >
          התחבר עם Facebook
        </button>

        <p style={styles.registerText}>
          עדיין אין לך חשבון?{' '}
          <Link href="/register" style={styles.registerLink}>
            הירשם עכשיו
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: '#f5f5f5',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '2rem',
    fontSize: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    color: '#666',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    '&:focus': {
      outline: 'none',
      borderColor: '#0070f3',
    },
  },
  button: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#0060df',
    },
    '&:disabled': {
      backgroundColor: '#ccc',
    },
  },
  divider: {
    margin: '2rem 0',
    position: 'relative' as const,
    textAlign: 'center' as const,
    borderTop: '1px solid #eee',
  },
  dividerText: {
    backgroundColor: '#fff',
    padding: '0 1rem',
    color: '#666',
    position: 'relative' as const,
    top: '-0.7rem',
  },
  socialButton: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  googleButton: {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ddd',
    '&:hover': {
      backgroundColor: '#f8f8f8',
    },
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#166fe5',
    },
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  },
  registerText: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    color: '#666',
  },
  registerLink: {
    color: '#0070f3',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  loadingContainer: {
    marginBottom: '1.5rem',
  },
  progressBarOuter: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: '#0070f3',
    borderRadius: '3px',
    transition: 'width 0.5s ease-in-out',
  },
  loadingMessage: {
    fontSize: '0.85rem',
    color: '#666',
    textAlign: 'center' as const,
  },
};
