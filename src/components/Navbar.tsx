'use client';

import AuthButton from './AuthButton';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.logo}>Wedding Planner</div>
        <div style={styles.links}>
          {user && <span>שלום, {user.fullName}</span>}
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '1rem 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
};

export default Navbar;
