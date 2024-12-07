'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const AuthButton = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleAuthAction = () => {
    if (user) {
      logout();
      router.push('/');
    } else {
      router.push('/login');
    }
  };

  return (
    <button
      onClick={handleAuthAction}
      style={{
        backgroundColor: user ? '#dc3545' : '#0070f3',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      {user ? 'התנתק' : 'התחבר'}
    </button>
  );
};

export default AuthButton; 