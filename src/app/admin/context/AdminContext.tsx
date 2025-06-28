'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminAuthCredentials, AdminContextType } from '../types/admin';
import toast from 'react-hot-toast';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// הגדרות אימות אדמין קבועות
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // בדיקה אם האדמין כבר מחובר
    const adminToken = localStorage.getItem('adminToken');
    const adminExpiry = localStorage.getItem('adminTokenExpiry');
    
    if (adminToken && adminExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(adminExpiry);
      
      if (now < expiry) {
        setIsAuthenticated(true);
      } else {
        // הטוקן פג
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminTokenExpiry');
      }
    }
    
    setIsLoading(false);
  }, []);

  const authenticate = async (credentials: AdminAuthCredentials): Promise<boolean> => {
    try {
      // בדיקת פרטי הגישה
      if (credentials.username === ADMIN_CREDENTIALS.username && 
          credentials.password === ADMIN_CREDENTIALS.password) {
        
        // יצירת טוקן פשוט (בפרויקט אמיתי זה יהיה JWT מהשרת)
        const token = btoa(`${credentials.username}:${Date.now()}`);
        const expiry = new Date().getTime() + (2 * 60 * 60 * 1000); // 2 שעות
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminTokenExpiry', expiry.toString());
        
        setIsAuthenticated(true);
        toast.success('התחברת בהצלחה כאדמין');
        return true;
      } else {
        toast.error('שם משתמש או סיסמה שגויים');
        return false;
      }
    } catch (error) {
      console.error('Admin authentication error:', error);
      toast.error('שגיאה בהתחברות');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    setIsAuthenticated(false);
    toast.success('התנתקת בהצלחה');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      authenticate,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
} 