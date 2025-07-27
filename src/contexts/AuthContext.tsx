'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  age?: string;
  gender?: string;
  location?: string;
  phoneNumber?: string;
  idNumber?: string;
  partnerName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  partnerIdNumber?: string;
  weddingDate?: string;
  expectedGuests?: string;
  weddingLocation?: string;
  budget?: string;
  preferences?: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  isProfileComplete?: boolean;
  sharedEventId?: string;
  connectedUserId?: string;
  isMainEventOwner?: boolean;
  partnerInvitePending?: boolean;
  partnerInviteAccepted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.time('auth-initialization');
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // בדוק אם יש token ו-user ב-URL parameters (מ-OAuth callback)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const urlToken = urlParams.get('token');
          const urlUser = urlParams.get('user');
        
          if (urlToken && urlUser) {
            console.log('Found auth data in URL parameters');
            try {
              const userData = JSON.parse(decodeURIComponent(urlUser));
              localStorage.setItem('token', urlToken);
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
              
              // נקה את ה-URL parameters
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('token');
              newUrl.searchParams.delete('user');
              window.history.replaceState({}, '', newUrl.toString());
              
              console.log('Successfully processed auth from URL');
              return;
            } catch (parseError) {
              console.error('Error parsing URL auth data:', parseError);
            }
          }
        }
        
        // אם לא מצאנו ב-URL, נבדוק ב-localStorage
        const [token, storedUser] = await Promise.all([
          Promise.resolve(localStorage.getItem('token')),
          Promise.resolve(localStorage.getItem('user'))
        ]);

        if (token && storedUser) {
          console.log('Found stored user data');
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('User data set:', userData._id);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          console.log('No stored user data found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        console.log('Auth initialization complete');
        setIsAuthReady(true);
        console.timeEnd('auth-initialization');
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (token: string, userData: User) => {
    try {
      console.time('user-login');
      console.log('Logging in user:', userData._id);
      
      await Promise.all([
        Promise.resolve(localStorage.setItem('token', token)),
        Promise.resolve(localStorage.setItem('user', JSON.stringify(userData)))
      ]);
      
      // אם המשתמש יש isProfileComplete: true, נעדכן את זה במסד הנתונים
      if (userData.isProfileComplete) {
        try {
          const updateResponse = await fetch(`/api/user/${userData._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              isProfileComplete: true
            })
          });
          
          if (updateResponse.ok) {
            const updatedData = await updateResponse.json();
            console.log('User profile completion status updated:', updatedData.user.isProfileComplete);
            // עדכון המשתמש עם הנתונים המעודכנים
            setUser(updatedData.user);
            localStorage.setItem('user', JSON.stringify(updatedData.user));
          } else {
            // אם העדכון נכשל, עדיין נשמור את המשתמש המקורי
            setUser(userData);
            console.log('Failed to update profile completion status, using original user data');
          }
        } catch (error) {
          console.error('Failed to update user profile completion status:', error);
          // אם יש שגיאה, עדיין נשמור את המשתמש המקורי
          setUser(userData);
        }
      } else {
        // אם אין isProfileComplete, נשמור את המשתמש כמו שהוא
        setUser(userData);
      }
      
      console.timeEnd('user-login');
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }, [router]);

  const contextValue = useMemo(() => {
    return {
      user,
      isAuthReady,
      login,
      logout
    };
  }, [user, isAuthReady, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 