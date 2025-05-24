'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const NavbarProfile = () => {
  const { user, isAuthReady } = useAuth();
  const pathname = usePathname();

  // אנימציות למעברים חלקים
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  // אם עדיין בודק הרשאות, הצג מצב טעינה
  if (!isAuthReady) {
    return (
      <nav style={styles.nav}>
        <div style={styles.container}>
          <motion.div 
            style={styles.loadingContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={styles.loadingDot}></div>
            <div style={styles.loadingDot}></div>
            <div style={styles.loadingDot}></div>
          </motion.div>
        </div>
      </nav>
    );
  }

  // אם אין משתמש לאחר בדיקת הרשאות, אל תציג כלום
  if (!user) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.nav 
        key="navbar-profile"
        style={styles.nav}
        {...fadeIn}
      >
        <div style={styles.container}>
          <div style={styles.tabs}>
            <Link 
              href={`/user/${user._id}`} 
              style={{
                ...styles.tab,
                ...(isActive(`/user/${user._id}`) && !isActive('/edit') && !isActive('/wedding') && !isActive('/checklist') && !isActive('/guestlist') && !isActive('/invitations') ? styles.activeTab : {})
              }}
            >
              הפרופיל שלי
            </Link>
            
            <Link 
              href={`/user/${user._id}/edit`}
              style={{
                ...styles.tab,
                ...(isActive('/edit') ? styles.activeTab : {})
              }}
            >
              עריכת פרופיל
            </Link>
            
            <Link 
              href={`/user/${user._id}/wedding`}
              style={{
                ...styles.tab,
                ...(isActive('/wedding') ? styles.activeTab : {})
              }}
            >
              החתונה שלי
            </Link>

            <Link 
              href={`/user/${user._id}/checklist`}
              style={{
                ...styles.tab,
                ...(isActive('/checklist') ? styles.activeTab : {})
              }}
            >
              צ&apos;ק ליסט
            </Link>

            <Link 
              href={`/user/${user._id}/guestlist`}
              style={{
                ...styles.tab,
                ...(isActive('/guestlist') ? styles.activeTab : {})
              }}
            >
              ניהול רשימת מוזמנים
            </Link>

            <Link 
              href={`/user/${user._id}/invitations`}
              style={{
                ...styles.tab,
                ...(isActive('/invitations') ? styles.activeTab : {})
              }}
            >
              🎨 יצירת הזמנות
            </Link>
          </div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
};

const styles = {
  nav: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    marginTop: '60px', // מרווח מתחת ל-Navbar הראשי
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 0',
  },
  tab: {
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    color: '#666',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    fontWeight: '500',
    '&:hover': {
      backgroundColor: '#0060df',
      color: '#ffffff',
    },
  },
  activeTab: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#0060df',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem 0',
    gap: '0.5rem',
  },
  loadingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#0070f3',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite',
    animationDelay: '0s',
    '&:nth-of-type(2)': {
      animationDelay: '0.3s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.6s',
    },
  },
};

export default NavbarProfile; 