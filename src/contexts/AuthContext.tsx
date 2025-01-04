'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          console.log('Found stored user data');
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('User data set:', userData._id);
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
      }
    };

    initializeAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      console.log('Logging in user:', userData._id);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
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
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, logout }}>
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