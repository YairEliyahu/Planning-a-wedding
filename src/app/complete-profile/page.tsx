'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { StepItem } from '@/components/step-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '../components/LoadingSpinner';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  age?: string;
  gender?: 'Male' | 'Female' | 'Other';
  location?: string;
  phone?: string;
  idNumber?: string;
  
  // Partner Details
  partnerName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  partnerIdNumber?: string;
  partnerGender?: 'Male' | 'Female' | 'Other';
  
  // Wedding Details
  weddingDate?: string;
  expectedGuests?: string;
  weddingLocation?: string;
  budget?: string;
  
  // Wedding Preferences
  preferences?: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  
  // Additional Wedding Details
  venueType?: 'garden' | 'nature' | '';
  timeOfDay?: 'evening' | 'afternoon' | '';
  locationPreference?: 'south' | 'center' | 'north' | '';
  
  isProfileComplete?: boolean;
  authProvider?: string;
  partnerInvitePending?: boolean;
  partnerInviteAccepted?: boolean;
}

interface FormData {
  // Personal Details
  fullName: string;
  email: string;
  age: string;
  gender: '' | 'Male' | 'Female' | 'Other';
  location: string;
  phone: string;
  idNumber: string;
  
  // Partner Details
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  partnerIdNumber: string;
  partnerGender: '' | 'Male' | 'Female' | 'Other';
  
  // Wedding Details
  weddingDate: string;
  expectedGuests: string;
  weddingLocation: string;
  budget: string;
  
  // Wedding Preferences
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  
  // Additional Wedding Details
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  locationPreference: 'south' | 'center' | 'north' | '';
}

export default function CompleteProfile() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Personal Details
    fullName: '',
    email: '',
    age: '',
    gender: '',
    location: '',
    phone: '',
    idNumber: '',
    
    // Partner Details
    partnerName: '',
    partnerEmail: '',
    partnerPhone: '',
    partnerIdNumber: '',
    partnerGender: '',
    
    // Wedding Details
    weddingDate: '',
    expectedGuests: '',
    weddingLocation: '',
    budget: '',
    preferences: {
      venue: false,
      catering: false,
      photography: false,
      music: false,
      design: false
    },
    venueType: '',
    timeOfDay: '',
    locationPreference: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?._id) return;

      try {
        const response = await fetch(`/api/user/${user._id}`);
        const data = await response.json();
        
        if (data.user) {
          setFormData(prev => ({
            ...prev,
            fullName: data.user.fullName || '',
            email: data.user.email || '',
            age: data.user.age || '',
            gender: data.user.gender || '',
            location: data.user.location || '',
            phone: data.user.phone || '', // Phone number from DB
            idNumber: data.user.idNumber || '',
            partnerName: data.user.partnerName || '',
            partnerEmail: data.user.partnerEmail || '',
            partnerPhone: data.user.partnerPhone || '',
            partnerIdNumber: data.user.partnerIdNumber || '',
            partnerGender: data.user.partnerGender || '',
            weddingDate: data.user.weddingDate ? new Date(data.user.weddingDate).toISOString().split('T')[0] : '',
            expectedGuests: data.user.expectedGuests?.toString() || '',
            weddingLocation: data.user.weddingLocation || '',
            budget: data.user.budget?.toString() || '',
            preferences: {
              venue: data.user.preferences?.venue || false,
              catering: data.user.preferences?.catering || false,
              photography: data.user.preferences?.photography || false,
              music: data.user.preferences?.music || false,
              design: data.user.preferences?.design || false
            },
            venueType: data.user.venueType || '',
            timeOfDay: data.user.timeOfDay || '',
            locationPreference: data.user.locationPreference || ''
          }));
          
          // Set invitation status if available
          if (data.user.partnerInvitePending) {
            setInviteStatus('sent');
            setInviteMessage(`הזמנה נשלחה ל-${data.user.partnerEmail}`);
          } else if (data.user.partnerInviteAccepted) {
            setInviteStatus('sent');
            setInviteMessage(`${data.user.partnerName || 'השותף/ה'} כבר מחובר/ת לחשבון`);
          }
        }
      } catch (error) {
        setError('שגיאה בטעינת נתוני המשתמש');
      } finally {
        setIsInitializing(false);
      }
    };

    loadUserData();
  }, [user?._id]);

  useEffect(() => {
    if (!isInitializing && !user) {
      router.push('/login');
    }
  }, [user, router, isInitializing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formattedData = {
        ...formData,
        weddingDate: formData.weddingDate ? new Date(formData.weddingDate).toISOString() : undefined,
        // הפיכת מספרים משרשרת לnumber
        expectedGuests: formData.expectedGuests ? Number(formData.expectedGuests) : undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
      };

      const response = await fetch(`/api/user/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formattedData,
          isProfileComplete: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // לאחר שהפרופיל עודכן בהצלחה
      // נעדכן את מידע המשתמש במערכת
      if (data.user) {
        await login(localStorage.getItem('token') || '', data.user);
        router.push(`/user/${user?._id}`);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בעדכון פרופיל');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; checked: boolean } }
  ) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    if (name.startsWith('preferences.')) {
      const preference = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [preference]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInvitePartner = async () => {
    if (!formData.partnerEmail) {
      setError('נא להזין את האימייל של בן/בת הזוג');
      return;
    }
    
    setInviteStatus('sending');
    setError('');
    
    try {
      const response = await fetch('/api/invite-partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?._id,
          partnerEmail: formData.partnerEmail,
          partnerName: formData.partnerName,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'שגיאה בשליחת ההזמנה');
      }
      
      setInviteStatus('sent');
      setInviteMessage(`הזמנה נשלחה ל-${formData.partnerEmail}`);
      
    } catch (error) {
      setInviteStatus('error');
      setError(error instanceof Error ? error.message : 'שגיאה בשליחת ההזמנה');
    }
  };

  if (isInitializing || isLoading) {
    return (
      <LoadingSpinner 
        text="טוען..." 
        size="large"
        fullScreen={true}
        color="pink"
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">פרטים אישיים</h2>
            <div className="space-y-4">
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
                <Label htmlFor="email">אימייל *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">גיל</Label>
                <Input 
                  id="age" 
                  name="age" 
                  type="number" 
                  value={formData.age} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">מגדר</Label>
                <select 
                  id="gender" 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="w-full p-2 border rounded"
                >
                  <option value="">בחר/י מגדר</option>
                  <option value="Male">זכר</option>
                  <option value="Female">נקבה</option>
                  <option value="Other">אחר</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">מיקום</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">מספר טלפון</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="idNumber">תעודת זהות</Label>
                <Input 
                  id="idNumber" 
                  name="idNumber" 
                  value={formData.idNumber} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">פרטי בן/ת הזוג</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">שם בן/בת הזוג</Label>
                <Input
                  id="partnerName"
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerEmail">אימייל</Label>
                <div className="flex gap-2">
                  <Input
                    id="partnerEmail"
                    name="partnerEmail"
                    type="email"
                    value={formData.partnerEmail}
                    onChange={handleChange}
                    required
                  />
                  <Button 
                    type="button" 
                    onClick={handleInvitePartner} 
                    disabled={inviteStatus === 'sending' || inviteStatus === 'sent' || !formData.partnerEmail}
                    className="whitespace-nowrap"
                  >
                    {inviteStatus === 'sending' ? 'שולח...' : 'הזמן לשיתוף'}
                  </Button>
                </div>
                {inviteStatus === 'sent' && (
                  <div className="mt-2 text-sm text-green-600">
                    {inviteMessage}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerPhone">טלפון</Label>
                <Input
                  id="partnerPhone"
                  name="partnerPhone"
                  type="tel"
                  value={formData.partnerPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerIdNumber">תעודת זהות</Label>
                <Input
                  id="partnerIdNumber"
                  name="partnerIdNumber"
                  value={formData.partnerIdNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerGender">מגדר</Label>
                <select
                  id="partnerGender"
                  name="partnerGender"
                  value={formData.partnerGender}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">בחר מגדר</option>
                  <option value="Male">זכר</option>
                  <option value="Female">נקבה</option>
                  <option value="Other">אחר</option>
                </select>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">גישה משותפת לחשבון</h3>
                <p className="text-sm text-blue-700 mb-2">
                  הזמנת בן/בת הזוג תאפשר גישה משותפת לחשבון זה.
                  {inviteStatus !== 'sent' && ' הקליקו על \'הזמן לשיתוף\' לאחר הזנת האימייל.'}
                </p>
                {inviteStatus === 'sent' && (
                  <p className="text-sm text-blue-700">
                    בן/בת הזוג יקבלו מייל עם הוראות לכניסה לחשבון. אם אין להם חשבון קיים, הם יתבקשו להירשם תחילה.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">פרטי החתונה</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weddingDate">תאריך חתונה</Label>
                <Input
                  id="weddingDate"
                  name="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedGuests">מספר אורחים משוער</Label>
                <Input
                  id="expectedGuests"
                  name="expectedGuests"
                  type="number"
                  placeholder="הכנס מספר אורחים משוער"
                  value={formData.expectedGuests}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weddingLocation">מיקום החתונה</Label>
                <Input
                  id="weddingLocation"
                  name="weddingLocation"
                  type="text"
                  placeholder="הכנס מיקום משוער"
                  value={formData.weddingLocation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">תקציב משוער</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="text"
                  placeholder="הכנס תקציב משוער"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venueType">סוג המקום</Label>
                <select
                  id="venueType"
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">בחר את סוג המקום</option>
                  <option value="garden">גן אירועים</option>
                  <option value="nature">אירוע בטבע</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeOfDay">שעת האירוע</Label>
                <select
                  id="timeOfDay"
                  name="timeOfDay"
                  value={formData.timeOfDay}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">בחר את שעת האירוע</option>
                  <option value="evening">חתונת ערב</option>
                  <option value="afternoon">חתונת צהריים</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationPreference">אזור בארץ</Label>
                <select
                  id="locationPreference"
                  name="locationPreference"
                  value={formData.locationPreference}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">בחר את האזור המועדף</option>
                  <option value="south">דרום</option>
                  <option value="center">מרכז</option>
                  <option value="north">צפון</option>
                </select>
              </div>
              <div className="space-y-4">
                <Label>במה תרצו שנעזור לכם?</Label>
                <div className="space-y-2">
                  {Object.entries(formData.preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        name={`preferences.${key}`}
                        checked={value}
                        onCheckedChange={(isChecked) => {
                          const checked = !!isChecked;
                          handleChange({
                            target: { 
                              name: `preferences.${key}`, 
                              checked 
                            }
                          } as React.ChangeEvent<HTMLInputElement>);
                        }}
                      />
                      <Label htmlFor={key} className="mr-2">
                        {key === 'venue' && 'אולם אירועים'}
                        {key === 'catering' && 'קייטרינג'}
                        {key === 'photography' && 'צילום'}
                        {key === 'music' && 'מוזיקה'}
                        {key === 'design' && 'עיצוב'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div dir="rtl">
      {user?.isProfileComplete && <Navbar />}
      <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center ${user?.isProfileComplete ? 'pt-20' : 'justify-center'} py-12 px-4 sm:px-6 lg:px-8`}>
        <Card className="w-full max-w-4xl shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">השלמת פרטי חתונה</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  נשמח לדעת עוד פרטים על החתונה שלכם
                </p>
              </div>
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="mb-4"
              />
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-[240px_1fr] gap-8 p-6">
            <div className="space-y-6 border-l pl-6">
              <StepItem
                step={1}
                label="פרטים אישיים"
                description="המידע שלך"
                status={currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming'}
              />
              <StepItem
                step={2}
                label="פרטי בן/בת הזוג"
                description="המידע של בן/בת הזוג"
                status={currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming'}
              />
              <StepItem
                step={3}
                label="פרטי החתונה"
                description="מידע על האירוע"
                status={currentStep === 3 ? 'current' : 'upcoming'}
              />
            </div>
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {renderStep()}

                <div className="flex justify-between pt-6 border-t mt-6">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      הקודם
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep} className={currentStep === 1 ? 'mr-auto' : ''}>
                      הבא
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading} className="mr-auto">
                      {isLoading ? 'מעדכן...' : 'סיום והמשך'}
                    </Button>
                  )}
                </div>
              </form>

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-center mt-4">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

