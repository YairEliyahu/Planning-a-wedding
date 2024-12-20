'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const NavbarProfile = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.tabs}>
          <Link 
            href={`/user/${user._id}`} 
            style={{
              ...styles.tab,
              ...(isActive(`/user/${user._id}`) && !isActive('/edit') && !isActive('/wedding') && !isActive('/checklist') && !isActive('/guestlist') ? styles.activeTab : {})
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
           צ'ק ליסט
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
        </div>
      </div>
    </nav>
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
};

export default NavbarProfile; 