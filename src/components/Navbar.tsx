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

  const handleProfileClick = () => {
    if (!user) return;
    
    if (user.isProfileComplete) {
      router.push(`/user/${user._id}`);
    } else {
      router.push('/complete-profile');
    }
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
        </div>

        <div style={styles.authButtons}>
          {user ? (
            <>
              <span style={styles.welcomeText}>
                שלום, {user.fullName}
              </span>
              <button 
                onClick={handleProfileClick} 
                style={{ 
                  ...styles.button, 
                  ...styles.profileButton,
                  ...(user.isProfileComplete ? {} : styles.incompleteProfileButton)
                }}
              >
                {user.isProfileComplete ? 'הפרופיל שלי' : 'השלם פרופיל'}
              </button>
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
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  link: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'color 0.3s ease',
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
    transition: 'background-color 0.3s ease',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    '&:hover': {
      backgroundColor: '#c82333',
    },
  },
  registerButton: {
    backgroundColor: '#28a745',
    '&:hover': {
      backgroundColor: '#218838',
    },
  },
  profileButton: {
    backgroundColor: '#0070f3',
    '&:hover': {
      backgroundColor: '#0060df',
    },
  },
  profileIncomplete: {
    color: '#dc3545',
    fontSize: '0.8rem',
    marginLeft: '0.5rem',
  },
  incompleteProfileButton: {
    backgroundColor: '#dc3545',
    '&:hover': {
      backgroundColor: '#c82333',
    },
  },
};

export default Navbar;
