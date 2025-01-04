'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  weddingDate: string;
  partnerName: string;
  partnerPhone: string;
  expectedGuests: string;
  weddingLocation: string;
  budget: string;
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  isProfileComplete: boolean;
  authProvider: string;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthReady) {
        console.log('Auth not ready yet');
        return;
      }

      console.log('Auth state:', { isAuthReady, user: user?._id });

      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      if (user._id !== params.id) {
        console.log('User ID mismatch:', { userId: user._id, paramsId: params.id });
        router.push(`/user/${user._id}`);
        return;
      }

      await fetchUserProfile();
    };

    checkAuth();
  }, [isAuthReady, user, params.id, router]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      if (!data.user.isProfileComplete) {
        router.push('/complete-profile');
        return;
      }

      setProfile(data.user);
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">הפרופיל לא נמצא</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              הפרופיל של {profile.fullName}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">פרטים אישיים</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">שם מלא:</span> {profile.fullName}</p>
                    <p><span className="font-medium">אימייל:</span> {profile.email}</p>
                    <p><span className="font-medium">טלפון:</span> {profile.phoneNumber}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">פרטי בן/בת הזוג</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">שם:</span> {profile.partnerName}</p>
                    <p><span className="font-medium">טלפון:</span> {profile.partnerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">פרטי החתונה</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">תאריך:</span> {new Date(profile.weddingDate).toLocaleDateString('he-IL')}</p>
                    <p><span className="font-medium">מיקום:</span> {profile.weddingLocation}</p>
                    <p><span className="font-medium">מספר אורחים:</span> {profile.expectedGuests}</p>
                    <p><span className="font-medium">תקציב:</span> {profile.budget}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">שירותים נדרשים</h3>
                  <div className="space-y-2">
                    {profile.preferences.venue && <p>✓ אולם אירועים</p>}
                    {profile.preferences.catering && <p>✓ קייטרינג</p>}
                    {profile.preferences.photography && <p>✓ צילום</p>}
                    {profile.preferences.music && <p>✓ מוזיקה</p>}
                    {profile.preferences.design && <p>✓ עיצוב</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => router.push(`/user/${profile._id}/edit`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ערוך פרופיל
              </button>
              {profile.authProvider === 'google' && (
                <button
                  onClick={() => router.push(`/user/${profile._id}/set-password`)}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  הגדר סיסמה
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 