'use client';

import { useRouter } from 'next/navigation';
import { UserProfile } from '../types/profileTypes';

interface PasswordAlertProps {
  profile: UserProfile;
}

export default function PasswordAlert({ profile }: PasswordAlertProps) {
  const router = useRouter();

  if (profile.authProvider !== 'google') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 mx-4 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl">🔒</span>
        </div>
        <div className="mr-3 flex-grow">
          <h3 className="text-lg font-medium text-blue-800">
            הגדר סיסמה לחשבון שלך
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            כרגע אתה יכול להתחבר רק עם Google. הגדר סיסמה כדי להתחבר גם בלי Google
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => router.push(`/set-password?email=${encodeURIComponent(profile.email)}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            הגדר סיסמה
          </button>
        </div>
      </div>
    </div>
  );
} 