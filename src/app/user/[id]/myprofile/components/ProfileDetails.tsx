'use client';

import { useRouter } from 'next/navigation';
import { UserProfile } from '../types/profileTypes';

interface ProfileDetailsProps {
  profile: UserProfile;
}

export default function ProfileDetails({ profile }: ProfileDetailsProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">פרטי פרופיל</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-base sm:text-lg font-medium mb-3 text-purple-700 border-b border-purple-200 pb-2">פרטים אישיים</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">שם מלא:</span>
                <span className="text-sm sm:text-base">{profile.fullName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">אימייל:</span>
                <span className="text-sm sm:text-base break-all">{profile.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">טלפון:</span>
                <span className="text-sm sm:text-base">{profile.phoneNumber}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-medium mb-3 text-pink-700 border-b border-pink-200 pb-2">פרטי בן/בת הזוג</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">שם:</span>
                <span className="text-sm sm:text-base">{profile.partnerName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-20">טלפון:</span>
                <span className="text-sm sm:text-base">{profile.partnerPhone}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-base sm:text-lg font-medium mb-3 text-blue-700 border-b border-blue-200 pb-2">פרטי החתונה</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-24">תאריך:</span>
                <span className="text-sm sm:text-base">{new Date(profile.weddingDate).toLocaleDateString('he-IL')}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-24">מיקום:</span>
                <span className="text-sm sm:text-base">{profile.weddingLocation}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-24">אורחים:</span>
                <span className="text-sm sm:text-base">{profile.expectedGuests}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-sm sm:text-base text-gray-700 sm:w-24">תקציב:</span>
                <span className="text-sm sm:text-base font-semibold">₪{parseInt(profile.budget).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-medium mb-3 text-green-700 border-b border-green-200 pb-2">שירותים נדרשים</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profile.preferences.venue && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> אולם אירועים</div>}
              {profile.preferences.catering && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> קייטרינג</div>}
              {profile.preferences.photography && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> צילום</div>}
              {profile.preferences.music && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> מוזיקה</div>}
              {profile.preferences.design && <div className="flex items-center text-sm sm:text-base"><span className="text-green-600 ml-2">✓</span> עיצוב</div>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <button
          onClick={() => router.push(`/user/${profile._id}/edit`)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base font-medium"
        >
          ערוך פרופיל
        </button>
        {profile.authProvider === 'google' && (
          <button
            onClick={() => router.push(`/set-password?email=${encodeURIComponent(profile.email)}`)}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base font-medium"
          >
            הגדר סיסמה
          </button>
        )}
      </div>
    </div>
  );
} 