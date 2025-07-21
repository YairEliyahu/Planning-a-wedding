'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function AcceptInvitationContent() {
  const [status, setStatus] = useState<'loading' | 'invalid' | 'success' | 'error' | 'redirecting'>('loading');
  const [message, setMessage] = useState('מאמת את ההזמנה...');
  const [inviterName, setInviterName] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();
  const token = searchParams.get('token') || localStorage.getItem('invitation_token');

  useEffect(() => {
    // לוגיקה שבודקת אם יש לנו טוקן ממופתח מהלוקאל סטורג'
    const storedToken = localStorage.getItem('invitation_token');
    const localUser = localStorage.getItem('user');

    // אם יש לנו משתמש חדש וטוקן הזמנה, זה סימן שסיימנו את תהליך ההרשמה
    if (localUser && storedToken) {
      const userObj = JSON.parse(localUser);
      const acceptInvitation = async () => {
        try {
          // נקבל את ההזמנה עבור המשתמש החדש
          const acceptResponse = await fetch('/api/accept-invitation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: storedToken, userId: userObj._id }),
          });

          const acceptData = await acceptResponse.json();

          if (!acceptResponse.ok) {
            setStatus('error');
            setMessage(acceptData.message || 'אירעה שגיאה בעת קבלת ההזמנה.');
            return;
          }

          // נעדכן את נתוני המשתמש במערכת
          if (acceptData.user) {
            await login(localStorage.getItem('token') || '', acceptData.user);
          }

          // ננקה את טוקן ההזמנה מהלוקאל סטורג'
          localStorage.removeItem('invitation_token');
          
          setStatus('success');
          setMessage('ההזמנה התקבלה בהצלחה! מיד תועבר לדף הבית.');
          
          // הפניה לדף הבית אחרי השהייה קצרה
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } catch (error) {
          console.error('Error accepting invitation:', error);
          setStatus('error');
          setMessage('אירעה שגיאה בעת קבלת ההזמנה.');
        }
      };

      acceptInvitation();
      return;
    }

    const verifyInvitation = async () => {
      // אם אין לנו טוקן בכלל, הקישור אינו תקין
      if (!token) {
        setStatus('invalid');
        setMessage('הקישור אינו תקין או שפג תוקפו.');
        return;
      }

      try {
        // אימות הטוקן
        const verifyResponse = await fetch('/api/verify-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          setStatus('invalid');
          setMessage(verifyData.message || 'הקישור אינו תקין או שפג תוקפו.');
          return;
        }

        setInviterName(verifyData.inviterName || 'בן/בת הזוג');

        // אם המשתמש לא מחובר, מעבירים אותו לדף ההרשמה
        if (!user) {
          setStatus('redirecting');
          setMessage('מפנה אותך לדף הרישום...');
          
          // שמירת הטוקן בלוקאל סטורג' זמנית
          localStorage.setItem('invitation_token', token.toString());
          
          // השהייה קצרה לפני ההפניה לשיפור חוויית המשתמש
          setTimeout(() => {
            // הפניה לדף הרישום הייעודי
            router.push(`/register-with-invitation?token=${token}`);
          }, 1500);
          return;
        }

        // אם המשתמש מחובר, מקבלים את ההזמנה
        const acceptResponse = await fetch('/api/accept-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, userId: user._id }),
        });

        const acceptData = await acceptResponse.json();

        if (!acceptResponse.ok) {
          setStatus('error');
          setMessage(acceptData.message || 'אירעה שגיאה בעת קבלת ההזמנה.');
          return;
        }

        // עדכון נתוני המשתמש המקומיים אם צריך
        if (acceptData.user) {
          await login(localStorage.getItem('token') || '', acceptData.user);
        }

        setStatus('success');
        setMessage('ההזמנה התקבלה בהצלחה! מיד תועבר לדף הבית.');
        
        // ניקוי טוקן ההזמנה מהלוקאל סטורג'
        localStorage.removeItem('invitation_token');
        
        // הפניה לדף הבית אחרי השהייה קצרה
        setTimeout(() => {
          router.push('/');
        }, 3000);

      } catch (error) {
        console.error('Error accepting invitation:', error);
        setStatus('error');
        setMessage('אירעה שגיאה בעת קבלת ההזמנה.');
      }
    };

    verifyInvitation();
  }, [token, user, router, login]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center border-b p-6">
          <div className="mb-4 w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
            <span className="text-3xl text-pink-500">💍</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">קבלת הזמנה לשיתוף חשבון</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 text-center">{message}</p>
            </div>
          )}
          
          {status === 'redirecting' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 text-center">{message}</p>
              <div className="bg-blue-50 p-4 rounded-md my-4">
                <p className="text-blue-800 text-sm">
                  נראה שעדיין לא נרשמת למערכת. מיד תועבר לדף הרישום המיוחד עבור שותפים.
                </p>
              </div>
            </div>
          )}
          
          {status === 'invalid' && (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">הקישור אינו תקין</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button onClick={() => router.push('/')}>
                חזרה לדף הבית
              </Button>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">ההזמנה התקבלה בהצלחה!</h3>
              <p className="text-gray-600 mb-2">
                הצטרפת בהצלחה לחשבון המשותף עם {inviterName}.
              </p>
              <div className="bg-blue-50 p-4 rounded-md my-4 text-right">
                <p className="text-blue-800 font-medium mb-2">מה קרה כעת?</p>
                <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
                  <li>כל פרטי החתונה סונכרנו בין החשבונות</li>
                  <li>רשימת המוזמנים תהיה זמינה לשניכם</li>
                  <li>צ&apos;ק-ליסט משותף נוצר עבורכם</li>
                  <li>כל עדכון שתבצעו יופיע בשני החשבונות</li>
                </ul>
              </div>
              <p className="text-gray-600 mb-6">
                מיד תועבר לדף הבית.
              </p>
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">אירעה שגיאה</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button onClick={() => router.push('/')}>
                חזרה לדף הבית
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInvitationContent />
    </Suspense>
  );
} 