'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const displayName = params.get('displayName');

    if (token && displayName) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // שימוש בשם המקורי מה-URL
        login(token, {
          ...payload,
          fullName: decodeURIComponent(displayName)
        });
        
        router.push('/');
      } catch (error) {
        console.error('Error processing token:', error);
        router.push('/login?error=invalid_token');
      }
    }
  }, []);

  return <div>מתחבר...</div>;
} 