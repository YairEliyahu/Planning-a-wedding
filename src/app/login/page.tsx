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
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h1 style={styles.title}>התחברות</h1>
        
        {error && <div style={styles.error}>{error}</div>}
        
        {isGoogleLoading && (
          <LoadingSpinner text={loadingMessage} />
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

        {isLoading && <LoadingSpinner text="מתחבר..." />}

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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    padding: '20px',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  form: {
    marginBottom: '1.5rem',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4a5568',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    transition: 'border-color 0.15s ease-in-out',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4299e1',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
  },
  dividerText: {
    margin: '0 1rem',
    color: '#a0aec0',
    fontSize: '0.875rem',
  },
  socialButton: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
    color: '#4a5568',
    border: '1px solid #e2e8f0',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
    color: '#fff',
  },
  registerText: {
    textAlign: 'center' as const,
    fontSize: '0.875rem',
    color: '#4a5568',
    marginTop: '1.5rem',
  },
  registerLink: {
    color: '#4299e1',
    fontWeight: '500',
    textDecoration: 'none',
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
  }
};
