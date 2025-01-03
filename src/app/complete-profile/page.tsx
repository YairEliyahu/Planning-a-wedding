'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { StepItem } from '@/components/step-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
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

interface FormData {
  // Personal Details
  fullName: string;
  email: string;
  age: string;
  gender: string;
  location: string;
  phoneNumber: string;
  idNumber: string;
  
  // Partner Details
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  partnerIdNumber: string;
  
  // Wedding Details
  weddingDate: string;
  expectedGuests: string;
  weddingLocation: string;
  budget: string;
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  }
}

export default function CompleteProfile() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Personal Details
    fullName: user?.fullName || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || '',
    location: user?.location || '',
    phoneNumber: user?.phoneNumber || '',
    idNumber: user?.idNumber || '',
    
    // Partner Details
    partnerName: user?.partnerName || '',
    partnerEmail: user?.partnerEmail || '',
    partnerPhone: user?.partnerPhone || '',
    partnerIdNumber: user?.partnerIdNumber || '',
    
    // Wedding Details
    weddingDate: user?.weddingDate ? new Date(user.weddingDate).toISOString().split('T')[0] : '',
    expectedGuests: user?.expectedGuests?.toString() || '',
    weddingLocation: user?.weddingLocation || '',
    budget: user?.budget?.toString() || '',
    preferences: {
      venue: user?.preferences?.venue || false,
      catering: user?.preferences?.catering || false,
      photography: user?.preferences?.photography || false,
      music: user?.preferences?.music || false,
      design: user?.preferences?.design || false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = searchParams?.get('token');
        const userJson = searchParams?.get('user');
        
        if (token && userJson) {
          const userData = JSON.parse(userJson);
          await login(token, userData);
          
          if (userData) {
            setFormData(prev => ({
              ...prev,
              fullName: userData.fullName || '',
              email: userData.email || '',
              age: userData.age || '',
              gender: userData.gender || '',
              location: userData.location || '',
              phoneNumber: userData.phoneNumber || '',
              idNumber: userData.idNumber || '',
              partnerName: userData.partnerName || '',
              partnerEmail: userData.partnerEmail || '',
              partnerPhone: userData.partnerPhone || '',
              partnerIdNumber: userData.partnerIdNumber || '',
              weddingDate: userData.weddingDate ? new Date(userData.weddingDate).toISOString().split('T')[0] : '',
              expectedGuests: userData.expectedGuests?.toString() || '',
              weddingLocation: userData.weddingLocation || '',
              budget: userData.budget?.toString() || '',
              preferences: {
                venue: userData.preferences?.venue || false,
                catering: userData.preferences?.catering || false,
                photography: userData.preferences?.photography || false,
                music: userData.preferences?.music || false,
                design: userData.preferences?.design || false
              }
            }));
          }
          
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          newUrl.searchParams.delete('user');
          window.history.replaceState({}, '', newUrl.toString());
        }
      } catch (error) {
        console.error('Error processing user data:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeUser();
  }, [searchParams, login]);

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
        expectedGuests: formData.expectedGuests.toString(),
        budget: formData.budget.toString(),
        isProfileComplete: true
      };

      const response = await fetch(`/api/user/${user?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      if (data.success && data.token && data.user) {
        await login(data.token, data.user);
        router.push('/');
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
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

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">שם מלא</Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="text-right"
                          required
                        />
                        {user?.fullName && formData.fullName !== user.fullName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            שם מקורי מגוגל: {user.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="text-right bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        כתובת האימייל מסונכרנת עם חשבון הגוגל שלך
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">גיל</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        className="text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">מגדר</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md text-right"
                        required
                      >
                        <option value="">בחר מגדר</option>
                        <option value="male">זכר</option>
                        <option value="female">נקבה</option>
                        <option value="other">אחר</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">מיקום</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">מספר טלפון</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">תעודת זהות</Label>
                      <Input
                        id="idNumber"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        className="text-right"
                        required
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="partnerName">שם בלא</Label>
                      <Input
                        id="partnerName"
                        name="partnerName"
                        value={formData.partnerName}
                        onChange={handleChange}
                        className="text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerEmail">אימייל</Label>
                      <Input
                        id="partnerEmail"
                        name="partnerEmail"
                        type="email"
                        value={formData.partnerEmail}
                        onChange={handleChange}
                        className="text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerPhone">טלפון</Label>
                      <Input
                        id="partnerPhone"
                        name="partnerPhone"
                        type="tel"
                        value={formData.partnerPhone}
                        onChange={handleChange}
                        className="text-right"
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
                        className="text-right"
                        required
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
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
                        className="text-right"
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
                        className="text-right"
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
                        className="text-right"
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
                        className="text-right"
                      />
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
                              onCheckedChange={(checked) => 
                                handleChange({
                                  target: { name: `preferences.${key}`, checked }
                                } as React.ChangeEvent<HTMLInputElement>)
                              }
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
                )}

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

