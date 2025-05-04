'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvitationData {
  inviterId: string;
  inviterName: string;
  partnerEmail: string;
  partnerName?: string;
  partnerPhone?: string;
}

export default function RegisterWithInvitation() {
  const [status, setStatus] = useState<'loading' | 'error' | 'ready' | 'registering' | 'success'>('loading');
  const [message, setMessage] = useState('טוען את פרטי ההזמנה...');
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    isProfileComplete: true
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Clear any existing auth data to prevent Navbar from showing
    if (typeof window !== 'undefined') {
      const existingToken = localStorage.getItem('token');
      // If user is already logged in but coming to this page, we should clear their session
      // since they're supposed to register as a new user
      if (existingToken && window.location.pathname.includes('register-with-invitation')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Store just the invitation token
        if (token) {
          localStorage.setItem('invitation_token', token);
        }
        // Force a page reload to clear any React state
        window.location.reload();
        return;
      }
    }

    const verifyInvitation = async () => {
      if (!token) {
        setStatus('error');
        setMessage('לא נמצא קוד הזמנה בכתובת. אנא ודא שהשתמשת בקישור המלא מהמייל.');
        return;
      }

      try {
        // Verify the invitation token
        const response = await fetch('/api/verify-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.message || 'ההזמנה אינה תקפה או שפג תוקפה');
          return;
        }

        // Get partner details from the inviter
        const inviterResponse = await fetch(`/api/user/${data.inviterId}`);
        const inviterData = await inviterResponse.json();

        if (!inviterResponse.ok) {
          setStatus('error');
          setMessage('לא ניתן לטעון את פרטי המזמין');
          return;
        }

        const invitationInfo: InvitationData = {
          inviterId: data.inviterId,
          inviterName: data.inviterName,
          partnerEmail: data.partnerEmail,
          partnerName: inviterData.user.partnerName,
          partnerPhone: inviterData.user.partnerPhone
        };

        setInvitationData(invitationInfo);
        
        // Pre-fill the form with the partner details
        setFormData(prev => ({
          ...prev,
          fullName: invitationInfo.partnerName || '',
          phone: invitationInfo.partnerPhone || ''
        }));

        setStatus('ready');
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setStatus('error');
        setMessage('אירעה שגיאה בעת אימות ההזמנה');
      }
    };

    verifyInvitation();
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.password) {
      setError('אנא מלא את כל שדות החובה');
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

    setStatus('registering');
    setError('');

    try {
      // Get additional data from inviter for pre-filling profile
      let inviterData = {};
      if (invitationData) {
        try {
          const inviterResponse = await fetch(`/api/user/${invitationData.inviterId}`);
          const inviterDetails = await inviterResponse.json();
          
          if (inviterResponse.ok && inviterDetails.user) {
            // Pre-fill profile with inviter's wedding data
            inviterData = {
              isProfileComplete: true,
              weddingDate: inviterDetails.user.weddingDate,
              expectedGuests: inviterDetails.user.expectedGuests,
              weddingLocation: inviterDetails.user.weddingLocation,
              budget: inviterDetails.user.budget,
              preferences: inviterDetails.user.preferences,
              venueType: inviterDetails.user.venueType,
              timeOfDay: inviterDetails.user.timeOfDay,
              locationPreference: inviterDetails.user.locationPreference,
              partnerName: inviterDetails.user.fullName,
              partnerEmail: inviterDetails.user.email,
              partnerPhone: inviterDetails.user.phone || '',
              partnerIdNumber: inviterDetails.user.idNumber || '',
              partnerGender: inviterDetails.user.gender || ''
            };
          }
        } catch (err) {
          console.error('Failed to fetch inviter details:', err);
          // Continue registration without pre-filled data
        }
      }
      
      // Register the new user with pre-filled data
      const registerResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: invitationData?.partnerEmail,
          password: formData.password,
          phone: formData.phone,
          ...inviterData // Include inviter data if available
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'שגיאה ברישום');
      }

      // Store token and user
      if (registerData.token) {
        localStorage.setItem('token', registerData.token);
        if (registerData.user) {
          localStorage.setItem('user', JSON.stringify(registerData.user));
        }
      }

      // Store invitation token for accept-invitation page
      localStorage.setItem('invitation_token', token as string);

      // Success - redirect to accept invitation
      setStatus('success');
      setTimeout(() => {
        router.push('/accept-invitation');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בתהליך ההרשמה');
      setStatus('ready');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center border-b p-6">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <CardTitle className="text-2xl font-bold text-center">רישום באמצעות הזמנה</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 text-center">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">שגיאה באימות ההזמנה</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button onClick={() => router.push('/')}>
                חזרה לדף הבית
              </Button>
            </div>
          )}
          
          {(status === 'ready' || status === 'registering') && invitationData && (
            <div>
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <p className="text-blue-800 font-medium">הוזמנת על ידי {invitationData.inviterName} לנהל יחד את החתונה!</p>
                <p className="text-sm text-blue-700 mt-2">אנא השלם את הרישום כדי להתחבר לחשבון המשותף</p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>שים לב:</strong> הפרופיל שלך יסונכרן אוטומטית עם פרטי החתונה שהוגדרו על ידי {invitationData.inviterName}
                  ולא תצטרך למלא אותם בנפרד.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">שם מלא *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">דואר אלקטרוני</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invitationData.partnerEmail}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">כתובת הדואר האלקטרוני נקבעה בהזמנה ולא ניתן לשנותה</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">סיסמה *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
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
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={status === 'registering'}
                >
                  {status === 'registering' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      מבצע רישום...
                    </>
                  ) : (
                    'סיום הרשמה'
                  )}
                </Button>
              </form>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">ההרשמה הושלמה בהצלחה!</h3>
              <p className="text-gray-600 mb-2">
                נרשמת בהצלחה וכעת תועבר למסך חיבור החשבונות
              </p>
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 