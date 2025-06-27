'use client';

import { TimeLeft, UserProfile } from '../types/profileTypes';

interface WeddingCountdownProps {
  profile: UserProfile;
  timeLeft: TimeLeft;
}

export default function WeddingCountdown({ profile, timeLeft }: WeddingCountdownProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 mb-8 text-center relative overflow-hidden">
      {/* רקע דקורטיבי */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-100/30 via-rose-100/20 to-pink-100/30"></div>
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-6 px-2">
          היי {profile.fullName} ו{profile.partnerName} 💕
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl mb-6 text-gray-700 font-medium">היום הגדול מתקרב!</p>
      
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 max-w-2xl mx-auto">
          <div className="text-center bg-gradient-to-br from-pink-100 to-rose-100 p-4 sm:p-6 rounded-2xl shadow-lg border border-pink-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">{timeLeft.days}</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">ימים</span>
          </div>
          <div className="text-center bg-gradient-to-br from-rose-100 to-pink-100 p-4 sm:p-6 rounded-2xl shadow-lg border border-rose-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">{timeLeft.hours}</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">שעות</span>
          </div>
          <div className="text-center bg-gradient-to-br from-pink-200 to-rose-200 p-4 sm:p-6 rounded-2xl shadow-lg border border-pink-300/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-700 to-rose-600 bg-clip-text text-transparent">{timeLeft.minutes}</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">דקות</span>
          </div>
          <div className="text-center bg-gradient-to-br from-rose-200 to-pink-200 p-4 sm:p-6 rounded-2xl shadow-lg border border-rose-300/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">{timeLeft.seconds}</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">שניות</span>
          </div>
        </div>
      
        <p className="text-base sm:text-lg text-gray-600 px-2 font-medium">
          תאריך החתונה: {new Date(profile.weddingDate).toLocaleDateString('he-IL')}
        </p>
      </div>
    </div>
  );
} 