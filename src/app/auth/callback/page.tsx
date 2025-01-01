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

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // שמירת המידע בקונטקסט
        login(token, payload);

        // הפניה לדף הבית
        router.push('/');
      } catch (error) {
        console.error('Error processing token:', error);
        router.push('/login?error=invalid_token');
      }
    } else {
      router.push('/login?error=no_token');
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">מתחבר למערכת...</p>
      </div>
    </div>
  );
} 