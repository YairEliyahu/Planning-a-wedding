'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function GoogleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const userJson = searchParams.get('user');

        if (!token || !userJson) {
          console.error('Missing token or user data');
          router.push('/login?error=MissingAuthData');
          return;
        }

        const userData = JSON.parse(userJson);
        await login(token, userData);

        // Redirect based on profile completion status
        router.push(userData.isProfileComplete ? '/' : '/complete-profile');
      } catch (error) {
        console.error('Error handling auth success:', error);
        router.push('/login?error=AuthProcessingFailed');
      }
    };

    handleAuthSuccess();
  }, [router, searchParams, login]);

  return (
    <div className="flex justify-center items-center h-screen flex-col gap-4">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        `
      }} />
      <div className="spinner" />
      <h2 className="text-xl font-semibold">מעבד את ההתחברות...</h2>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleSuccessContent />
    </Suspense>
  );
} 