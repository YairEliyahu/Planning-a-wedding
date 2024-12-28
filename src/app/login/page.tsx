'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
            disabled={isLoading}
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
        >
          התחבר עם Google
        </button>

        <button 
          onClick={handleFacebookLogin} 
          style={{ ...styles.socialButton, ...styles.facebookButton }}
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
};
