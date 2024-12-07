'use client';

import { useAuth } from '../contexts/AuthContext';

export default function UserStatus() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={styles.container}>
      <span>Welcome, {user?.fullName}</span>
      <button onClick={logout} style={styles.button}>Logout</button>
    </div>
  );
}

const styles = {
  container: {
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  button: {
    padding: '5px 10px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}; 