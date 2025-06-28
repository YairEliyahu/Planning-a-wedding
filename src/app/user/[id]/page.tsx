'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MyProfileQueryProvider } from './myprofile/providers/QueryProvider';
import { UserProfileProvider, useUserProfile } from './myprofile/context/UserProfileContext';
import WeddingCountdown from './myprofile/components/WeddingCountdown';
import BudgetAnalysis from './myprofile/components/BudgetAnalysis';
import WalletCard from './myprofile/components/WalletCard';
import RecentTransactions from './myprofile/components/RecentTransactions';
import ProfileDetails from './myprofile/components/ProfileDetails';
import PasswordAlert from './myprofile/components/PasswordAlert';
import { ProfilePageParams } from './myprofile/types/profileTypes';

// Main profile content component
function ProfileContent({ userId }: { userId: string }) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const {
    profile,
    timeLeft,
    walletInfo,
    budgetAnalysis,
    isProfileLoading,
    isChecklistLoading,
    isPreferencesLoading,
    profileError,
    checklistError,
    preferencesError,
    refetchAll
  } = useUserProfile();

  // Auth and user validation
  if (!isAuthReady) {
    return (
      <LoadingSpinner 
        text="טוען נתוני אימות..."
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user._id !== userId) {
    router.push(`/user/${user._id}`);
    return null;
  }

  // Loading states
  const isLoading = isProfileLoading || isChecklistLoading || isPreferencesLoading;
  if (isLoading) {
    return (
      <LoadingSpinner 
        text="טוען נתוני פרופיל..."
        size="large"
        fullScreen={true}
        color="pink"
        bgOpacity={0.9}
      />
    );
  }

  // Error handling
  const hasError = profileError || checklistError || preferencesError;
  if (hasError) {
    const errorMessage = profileError ? 
      'שגיאה בטעינת פרופיל המשתמש' : 
      'שגיאה בטעינת נתוני החתונה';
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-500 text-xl font-bold mb-4">שגיאה בטעינת הנתונים</h2>
          <p className="text-gray-700 mb-6">{errorMessage}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => refetchAll()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              נסה שנית
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">לא נמצא פרופיל</div>
      </div>
    );
  }

  // Check if profile is complete
  if (profile.isProfileComplete === false) {
    router.push('/complete-profile');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <Navbar />
      
      {/* Password setup alert for Google users */}
      <PasswordAlert profile={profile} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Wedding countdown */}
        <WeddingCountdown profile={profile} timeLeft={timeLeft} />

        {/* Budget analysis and wallet grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Budget analysis */}
          {budgetAnalysis.categories.length > 0 && (
            <BudgetAnalysis budgetAnalysis={budgetAnalysis} />
          )}
          
          {/* Wallet */}
          <WalletCard walletInfo={walletInfo} />
        </div>
        
        {/* Recent transactions */}
        <RecentTransactions walletInfo={walletInfo} />
        
        {/* Profile details */}
        <ProfileDetails profile={profile} />
      </main>
    </div>
  );
}

// Main page component with providers
export default function UserProfilePage({ params }: { params: ProfilePageParams }) {
  return (
    <MyProfileQueryProvider>
      <UserProfileProvider userId={params.id}>
        <ProfileContent userId={params.id} />
      </UserProfileProvider>
    </MyProfileQueryProvider>
  );
}