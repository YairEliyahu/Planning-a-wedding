'use client';

import { WalletInfo } from '../types/profileTypes';

interface WalletCardProps {
  walletInfo: WalletInfo;
}

export default function WalletCard({ walletInfo }: WalletCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 relative overflow-hidden">
      {/* רקע דקורטיבי */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-200/40 to-transparent rounded-full"></div>
      <div className="relative z-10">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent flex items-center gap-2">
          💳 הארנק שלי
        </h3>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200/50 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">תקציב כולל (נגזר מ-checklist)</p>
                <p className="text-xl sm:text-2xl font-bold text-pink-700">₪{walletInfo.totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200/50 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">הוצאות</p>
                <p className="text-xl sm:text-2xl font-bold text-rose-700">₪{walletInfo.spentBudget.toLocaleString()}</p>
              </div>
              <div className="text-2xl">💸</div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl border border-pink-300/50 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">נותר</p>
                <p className="text-xl sm:text-2xl font-bold text-pink-800">₪{walletInfo.remainingBudget.toLocaleString()}</p>
              </div>
              <div className="text-2xl">💎</div>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-pink-100 rounded-full h-4 mb-4 shadow-inner">
          <div 
            className="bg-gradient-to-r from-pink-400 via-rose-500 to-pink-600 h-4 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${walletInfo.totalBudget > 0 ? Math.min((walletInfo.spentBudget / walletInfo.totalBudget) * 100, 100) : 0}%` }}
          ></div>
        </div>
      
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">
            {walletInfo.totalBudget > 0 ? Math.round((walletInfo.spentBudget / walletInfo.totalBudget) * 100) : 0}% מהתקציב נוצל
          </p>
        </div>
      </div>
    </div>
  );
} 