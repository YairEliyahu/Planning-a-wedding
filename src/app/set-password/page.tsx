'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SetPasswordContent() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      setError('נא למלא את כל השדות');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'שגיאה בהגדרת הסיסמה');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בהגדרת הסיסמה');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">שגיאה</h3>
            <p className="text-gray-600 mb-6">לא נמצא אימייל בכתובת</p>
            <Button onClick={() => router.push('/login')}>
              חזרה לכניסה
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center border-b p-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl text-white">🔒</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">הגדרת סיסמה</CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            הגדר סיסמה לחשבון שלך כדי להתחבר גם בלי Google
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">הסיסמה הוגדרה בהצלחה!</h3>
              <p className="text-gray-600 mb-2">
                כעת ניתן להתחבר גם עם סיסמה וגם עם Google
              </p>
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-blue-800 font-medium">הגדרת סיסמה לחשבון: {email}</p>
                <p className="text-sm text-blue-700 mt-2">
                  לאחר הגדרת הסיסמה תוכל להתחבר גם עם Google וגם עם האימייל והסיסמה
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">סיסמה חדשה *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="הכנס סיסמה חדשה"
                  />
                  <p className="text-xs text-gray-500">הסיסמה חייבת להכיל לפחות 6 תווים</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">אימות סיסמה *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="הכנס שוב את הסיסמה"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      מגדיר סיסמה...
                    </>
                  ) : (
                    'הגדר סיסמה'
                  )}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => router.push('/login')}>
                  חזרה לכניסה
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetPasswordContent />
    </Suspense>
  );
} 