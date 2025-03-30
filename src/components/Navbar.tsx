'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthReady } = useAuth();
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

  // אנימציות למעברים חלקים
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.linksContainer}>
          <div style={styles.links}>
            <Link 
              href="/#section-home" 
              style={styles.link}
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname === '/') {
                  const event = new CustomEvent('navigate-section', { 
                    detail: { section: 0 } 
                  });
                  window.dispatchEvent(event);
                } else {
                  router.push('/#section-home');
                }
              }}
            >
              דף הבית
            </Link>
            <Link 
              href="/#section-services" 
              style={styles.link}
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname === '/') {
                  const event = new CustomEvent('navigate-section', { 
                    detail: { section: 1 } 
                  });
                  window.dispatchEvent(event);
                } else {
                  router.push('/#section-services');
                }
              }}
            >
              ספקים
            </Link>
            <Link 
              href="/#section-contact" 
              style={styles.link}
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname === '/') {
                  const event = new CustomEvent('navigate-section', { 
                    detail: { section: 2 } 
                  });
                  window.dispatchEvent(event);
                } else {
                  router.push('/#section-contact');
                }
              }}
            >
              צור קשר
            </Link>
            <Link href="/about" style={styles.link}>
              אודות
            </Link>
          </div>
        </div>

        <Link 
          href="/#section-home" 
          style={styles.logo}
          onClick={(e) => {
            e.preventDefault();
            if (window.location.pathname === '/') {
              const event = new CustomEvent('navigate-section', { 
                detail: { section: 0 } 
              });
              window.dispatchEvent(event);
            } else {
              router.push('/#section-home');
            }
          }}
        >
          Wedding Planner
        </Link>

        <div style={styles.authButtonsContainer}>
          <AnimatePresence mode="wait">
            {!isAuthReady ? (
              // מצב טעינה - ממתין לבדיקת אימות
              <motion.div 
                key="loading"
                style={styles.authButtons}
                {...fadeIn}
              >
                <div style={styles.authPlaceholder}>
                  <div style={styles.loadingDot}></div>
                  <div style={styles.loadingDot}></div>
                  <div style={styles.loadingDot}></div>
                </div>
              </motion.div>
            ) : user ? (
              // המשתמש מחובר
              <motion.div 
                key="logged-in"
                style={styles.authButtons}
                {...fadeIn}
              >
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
              </motion.div>
            ) : (
              // המשתמש לא מחובר
              <motion.div 
                key="logged-out"
                style={styles.authButtons}
                {...fadeIn}
              >
                <Link href="/login" style={styles.button}>
                  התחבר
                </Link>
                <Link href="/register" style={{ ...styles.button, ...styles.registerButton }}>
                  הרשמה
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(10px)',
    position: 'fixed' as const,
    width: '100%',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative' as const,
  },
  logo: {
    fontSize: '2rem',
    fontWeight: 'normal',
    color: '#ff4081',
    textDecoration: 'none',
    fontFamily: 'var(--font-pacifico), cursive',
    transition: 'color 0.3s ease, transform 0.3s ease',
    position: 'absolute' as const,
    left: '50%',
    transform: 'translateX(-50%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      color: '#e91e63',
      transform: 'translateX(-50%) scale(1.05)',
    },
  },
  linksContainer: {
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  links: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  link: {
    color: '#555',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 0',
    position: 'relative' as const,
    transition: 'color 0.3s ease',
    '&:hover': {
      color: '#0070f3',
    },
    '&:after': {
      content: '""',
      position: 'absolute' as const,
      width: '0',
      height: '2px',
      bottom: '0',
      left: '0',
      backgroundColor: '#0070f3',
      transition: 'width 0.3s ease',
    },
    '&:hover:after': {
      width: '100%',
    }
  },
  authButtonsContainer: {
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  welcomeText: {
    marginRight: '1rem',
    color: '#666',
    fontWeight: '500',
  },
  button: {
    padding: '0.5rem 1.2rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'none',
    fontSize: '0.9rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 112, 243, 0.2)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 112, 243, 0.3)',
    },
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
    '&:hover': {
      backgroundColor: '#c82333',
      boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)',
    },
  },
  registerButton: {
    backgroundColor: '#28a745',
    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)',
    '&:hover': {
      backgroundColor: '#218838',
      boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)',
    },
  },
  profileButton: {
    backgroundColor: '#0070f3',
    boxShadow: '0 2px 4px rgba(0, 112, 243, 0.2)',
    '&:hover': {
      backgroundColor: '#0060df',
      boxShadow: '0 4px 8px rgba(0, 112, 243, 0.3)',
    },
  },
  profileIncomplete: {
    color: '#dc3545',
    fontSize: '0.8rem',
    marginLeft: '0.5rem',
  },
  incompleteProfileButton: {
    backgroundColor: '#dc3545',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
    '&:hover': {
      backgroundColor: '#c82333',
      boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)',
    },
  },
  navLink: {
    color: '#555',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 0',
    position: 'relative' as const,
    transition: 'color 0.3s ease',
    '&:hover': {
      color: '#0070f3',
    },
    '&:after': {
      content: '""',
      position: 'absolute' as const,
      width: '0',
      height: '2px',
      bottom: '0',
      left: '0',
      backgroundColor: '#0070f3',
      transition: 'width 0.3s ease',
    },
    '&:hover:after': {
      width: '100%',
    }
  },
  // New styles for loading animation
  authPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    height: '36px',
    width: '120px',
  },
  loadingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#0070f3',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite',
    animationDelay: '0s',
    '&:nth-child(2)': {
      animationDelay: '0.3s',
    },
    '&:nth-child(3)': {
      animationDelay: '0.6s',
    },
    '@keyframes pulse': {
      '0%, 100%': {
        transform: 'scale(0.5)',
        opacity: 0.5,
      },
      '50%': {
        transform: 'scale(1)',
        opacity: 1,
      },
    },
  },
};

export default Navbar;
