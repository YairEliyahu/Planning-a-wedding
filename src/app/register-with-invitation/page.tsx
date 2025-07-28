'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '../components/LoadingSpinner';

interface InvitationData {
  inviterId: string;
  inviterName: string;
  partnerEmail: string;
  partnerName?: string;
  partnerPhone?: string;
}

function RegisterWithInvitationContent() {
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

  // Phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    const mobileRegex = /^05[0-9]{8}$/;
    const landlineRegex = /^0[2-4,8-9][0-9]{7}$/;
    return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      setFormData(prev => ({
        ...prev,
        phone: value
      }));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingToken = localStorage.getItem('token');
      if (existingToken && window.location.pathname.includes('register-with-invitation')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (token) {
          localStorage.setItem('invitation_token', token);
        }
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
        console.log('Invitation verification response:', data); // Debug log

        if (!response.ok) {
          setStatus('error');
          setMessage(data.message || 'ההזמנה אינה תקפה או שפג תוקפה');
          return;
        }

        // Get partner details from the inviter - עם cache busting
        const timestamp = Date.now();
        const inviterResponse = await fetch(`/api/user/${data.inviterId}?_t=${timestamp}`, {
          cache: 'no-store', // מאלץ fetch חדש
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const inviterData = await inviterResponse.json();
        console.log('Inviter data response (with cache busting):', inviterData);
        console.log('Full inviter user object:', inviterData.user);

        if (!inviterResponse.ok) {
          setStatus('error');
          setMessage('לא ניתן לטעון את פרטי המזמין');
          return;
        }

        // שליפת שם השותף ממספר מקורות אפשריים
        const partnerName = 
          inviterData.user?.partnerName || // השם שהמזמין הזין בפרופיל שלו
          data.partnerName || // השם מטוקן ההזמנה (אם קיים)
          ''; 

        const partnerPhone = 
          inviterData.user?.partnerPhone || 
          data.partnerPhone || 
          '';

        console.log('🔍 Partner data found:');
        console.log('  - partnerName from inviter profile:', inviterData.user?.partnerName);
        console.log('  - partnerName from invitation token:', data.partnerName);
        console.log('  - Final partnerName:', partnerName);
        console.log('  - Final partnerPhone:', partnerPhone);

        const invitationInfo: InvitationData = {
          inviterId: data.inviterId,
          inviterName: data.inviterName,
          partnerEmail: data.partnerEmail,
          partnerName: partnerName,
          partnerPhone: partnerPhone
        };

        setInvitationData(invitationInfo);
        
        // Pre-fill the form with the partner details
        setFormData(prev => ({
          ...prev,
          fullName: partnerName || '',
          phone: partnerPhone || ''
        }));

        console.log('Form data set with:', { fullName: partnerName, phone: partnerPhone }); // Debug log

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
    
    // Enhanced validation - use partner name from invitation if available
    const finalFullName = invitationData?.partnerName || formData.fullName;
    
    if (!finalFullName || !formData.password) {
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

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setError('מספר טלפון לא תקין (דוגמאות: 0501234567 או 026789012)');
      return;
    }

    setStatus('registering');
    setError('');

    try {
      let inviterData = {};
      if (invitationData) {
        try {
          const inviterResponse = await fetch(`/api/user/${invitationData.inviterId}`);
          const inviterDetails = await inviterResponse.json();
          
          if (inviterResponse.ok && inviterDetails.user) {
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
        }
      }
      
      const registerResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: finalFullName,
          email: invitationData?.partnerEmail,
          password: formData.password,
          phone: formData.phone,
          isProfileComplete: true,
          ...inviterData
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'שגיאה ברישום');
      }

      if (registerData.token) {
        localStorage.setItem('token', registerData.token);
        if (registerData.user) {
          localStorage.setItem('user', JSON.stringify(registerData.user));
        }
      }

      localStorage.setItem('invitation_token', token as string);

      setStatus('success');
      setTimeout(() => {
        const userParam = encodeURIComponent(JSON.stringify(registerData.user));
        router.push(`/?token=${registerData.token}&user=${userParam}`);
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בתהליך ההרשמה');
      setStatus('ready');
    }
  };

  if (status === 'loading') {
    return (
      <LoadingSpinner 
        text="טוען את פרטי ההזמנה..." 
        size="large"
        fullScreen={true}
        color="pink"
      />
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-6">
        {/* Enhanced Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mb-6 shadow-xl animate-pulse-gentle">
            <span className="text-4xl">💒</span>
          </div>
          <h1 className="heading-primary text-5xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            הצטרפות להזמנה
          </h1>
          <p className="text-gray-600 text-xl leading-relaxed max-w-2xl mx-auto">
            ברוכים הבאים! ✨ נשמח לראות אתכם מצטרפים לתכנון החתונה
          </p>
        </div>

        <Card className="card-enhanced w-full max-w-2xl">
          <CardContent className="p-10">
            {status === 'error' && (
              <div className="text-center py-12 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full mb-6 shadow-lg">
                  <span className="text-3xl text-white">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">שגיאה באימות ההזמנה</h3>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <p className="text-red-700 leading-relaxed">{message}</p>
                </div>
                <Button 
                  onClick={() => router.push('/')}
                  className="btn-primary"
                >
                  ← חזרה לדף הבית
                </Button>
              </div>
            )}
            
            {(status === 'ready' || status === 'registering') && invitationData && (
              <div className="animate-fade-in-up">
                {/* Invitation Info Card */}
                <div className="feature-card mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-800 mb-1">
                        הוזמנת על ידי {invitationData.inviterName}!
                      </h3>
                      <p className="text-blue-700">לנהל יחד את החתונה החלומית שלכם</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">📧</span>
                      <span className="text-blue-800 font-medium">האימייל שלך:</span>
                      <span className="text-blue-700">{invitationData.partnerEmail}</span>
                    </div>
                    
                    {!invitationData.partnerName ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-600">ℹ️</span>
                          <span className="text-yellow-800 font-medium">הערה:</span>
                        </div>
                        <p className="text-yellow-700 text-sm leading-relaxed">
                          {invitationData.inviterName} לא הזין/ה את השם שלך בפרופיל. 
                          אנא הזן/י את השם שלך במטה כדי להמשיך ברישום.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">👤</span>
                        <span className="text-blue-800 font-medium">השם שלך:</span>
                        <span className="text-blue-700">{invitationData.partnerName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✨</span>
                      <div className="flex-1">
                        <p className="text-blue-800 font-medium mb-1">מה קורה אחרי ההרשמה?</p>
                        <p className="text-blue-700 text-sm leading-relaxed">
                          הפרופיל שלך יסונכרן אוטומטית עם פרטי החתונה שהוגדרו על ידי {invitationData.inviterName}, 
                          ותוכלו לנהל יחד את כל התכנון!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Form */}
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      השלמת הרשמה
                    </h2>
                    <p className="text-gray-600">אנא השלימו את הפרטים הבאים להשלמת התהליך</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="form-label-enhanced">
                          <span className="text-red-500">*</span>
                          <span>👤 שם מלא</span>
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={invitationData?.partnerName || formData.fullName}
                          onChange={handleChange}
                          disabled={!!invitationData?.partnerName}
                          className={`form-input-enhanced ${
                            invitationData?.partnerName ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                          placeholder={
                            invitationData?.partnerName 
                              ? '' 
                              : 'הזן את שמך המלא'
                          }
                          required={true}
                        />
                        {invitationData?.partnerName ? (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>🔒</span>
                            השם נקבע על ידי {invitationData.inviterName} ולא ניתן לשנותו
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>✏️</span>
                            הזן את השם שלך כפי שתרצה שיופיע במערכת
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email" className="form-label-enhanced">
                          <span>📧 דואר אלקטרוני</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={invitationData.partnerEmail}
                          disabled
                          className="form-input-enhanced bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>🔒</span>
                          כתובת הדואר האלקטרוני נקבעה בהזמנה ולא ניתן לשנותה
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="form-label-enhanced">
                          <span>📱 מספר טלפון</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handlePhoneNumberChange}
                          className="form-input-enhanced"
                          placeholder="0xxxxxxxxx"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="password" className="form-label-enhanced">
                          <span className="text-red-500">*</span>
                          <span>🔐 סיסמה</span>
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-input-enhanced"
                          placeholder="לפחות 6 תווים"
                          required
                        />
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="confirmPassword" className="form-label-enhanced">
                          <span className="text-red-500">*</span>
                          <span>🔐 אימות סיסמה</span>
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="form-input-enhanced"
                          placeholder="הזן שוב את הסיסמה"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={status === 'registering'}
                      className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
                    >
                      {status === 'registering' ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          מבצע רישום...
                        </>
                      ) : (
                        <>
                          ✅ סיום הרשמה והצטרפות
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-center py-12 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg">
                  <span className="text-3xl text-white">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">ההרשמה הושלמה בהצלחה!</h3>
                <div className="feature-card mb-6">
                  <p className="text-gray-700 leading-relaxed mb-3">
                    🎉 נרשמת בהצלחה לחשבון המשותף!
                  </p>
                  <p className="text-gray-600 text-sm">
                    מעבירים אותך עכשיו לדף הבית שלכם...
                  </p>
                </div>
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-message-enhanced animate-fade-in-up mt-6">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterWithInvitationPage() {
  return (
    <Suspense fallback={
      <LoadingSpinner 
        text="טוען..." 
        size="large"
        fullScreen={true}
        color="pink"
      />
    }>
      <RegisterWithInvitationContent />
    </Suspense>
  );
} 