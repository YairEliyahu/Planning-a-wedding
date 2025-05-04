'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
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

  return (
    <div style={styles.container}>
      <h1>הרשמה</h1>
      
      {hasInvitation && (
        <div style={styles.invitationMessage}>
          <p>התקבלה הזמנה לשיתוף ניהול חשבון חתונה!</p>
          <p>אנא השלם את ההרשמה כדי להצטרף לחשבון המשותף.</p>
        </div>
      )}
      
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleRegister} style={styles.form}>
        <input
          type="text"
          placeholder="שם מלא *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="גיל"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={styles.input}
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          style={styles.input}
        >
          <option value="">בחר מגדר</option>
          <option value="Male">זכר</option>
          <option value="Female">נקבה</option>
          <option value="Other">אחר</option>
        </select>
        <input
          type="text"
          placeholder="מיקום"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.input}
        />
        <input
          type="tel"
          placeholder="מספר טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="מספר תעודת זהות"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="אימייל *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="סיסמה *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button 
          type="submit" 
          style={styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'מבצע רישום...' : 'הרשמה'}
        </button>
      </form>
      
      {isLoading && <LoadingSpinner text="מבצע רישום..." />}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '80px',
    padding: 'center' as const,
    textAlign: 'center' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.75rem',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#0070f3',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
  invitationMessage: {
    backgroundColor: '#d1fadf',
    padding: '1rem',
    borderRadius: '5px',
    marginBottom: '1rem',
  },
};

export default RegisterPage;
