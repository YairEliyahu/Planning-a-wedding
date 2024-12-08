'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link href="/" style={styles.logo}>
          Wedding Planner
        </Link>

        <div style={styles.links}>
          <Link href="/" style={styles.link}>
            דף הבית
          </Link>
          <Link href="/about" style={styles.link}>
            אודות
          </Link>

          <div style={styles.authButtons}>
            {user ? (
              <>
                <span style={styles.welcomeText}>
                  שלום, {user.fullName}
                </span>
                <Link href={`/user/${user._id}`} style={styles.button}>
                  הפרופיל שלי
                </Link>
                <button 
                  onClick={handleLogout} 
                  style={{ ...styles.button, ...styles.logoutButton }}
                >
                  התנתק
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={styles.button}>
                  התחבר
                </Link>
                <Link href="/register" style={{ ...styles.button, ...styles.registerButton }}>
                  הרשמה
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'fixed' as const,
    width: '100%',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    textDecoration: 'none',
    fontFamily: 'Arial, sans-serif',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  link: {
    color: '#333',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '1rem',
    '&:hover': {
      color: '#0070f3',
    },
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  welcomeText: {
    marginRight: '1rem',
    color: '#666',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'none',
    fontSize: '0.9rem',
    backgroundColor: '#0070f3',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  registerButton: {
    backgroundColor: '#28a745',
  },
};

export default Navbar;
