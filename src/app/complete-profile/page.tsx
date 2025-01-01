'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function CompleteProfile() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(true);
  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || '',
    weddingDate: user?.weddingDate ? new Date(user.weddingDate).toISOString().split('T')[0] : '',
    partnerName: user?.partnerName || '',
    partnerPhone: user?.partnerPhone || '',
    expectedGuests: user?.expectedGuests || '',
    weddingLocation: user?.weddingLocation || '',
    budget: user?.budget || '',
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
          
          // Initialize form data with user data if available
          if (userData) {
            setFormData({
              phoneNumber: userData.phoneNumber || '',
              weddingDate: userData.weddingDate ? new Date(userData.weddingDate).toISOString().split('T')[0] : '',
              partnerName: userData.partnerName || '',
              partnerPhone: userData.partnerPhone || '',
              expectedGuests: userData.expectedGuests || '',
              weddingLocation: userData.weddingLocation || '',
              budget: userData.budget || '',
              preferences: {
                venue: userData.preferences?.venue || false,
                catering: userData.preferences?.catering || false,
                photography: userData.preferences?.photography || false,
                music: userData.preferences?.music || false,
                design: userData.preferences?.design || false
              }
            });
          }
          
          // Clean URL parameters
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
  }, [searchParams, login, user]);

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
      // Format the data before sending
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
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
        [name]: value
      }));
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {user?.isProfileComplete && <Navbar />}
      <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center ${user?.isProfileComplete ? 'pt-20' : 'justify-center'} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              השלמת פרטי חתונה
            </h2>
            <p className="text-gray-600">
              נשמח לדעת עוד פרטים על החתונה שלכם
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר טלפון
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="הכנס מספר טלפון"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך חתונה
                </label>
                <input
                  type="date"
                  name="weddingDate"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.weddingDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם בן/בת הזוג
                </label>
                <input
                  type="text"
                  name="partnerName"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.partnerName}
                  onChange={handleChange}
                  placeholder="הכנס שם בן/בת הזוג"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון בן/בת הזוג
                </label>
                <input
                  type="tel"
                  name="partnerPhone"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.partnerPhone}
                  onChange={handleChange}
                  placeholder="הכנס מספר טלפון"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר אורחים משוער
                </label>
                <input
                  type="number"
                  name="expectedGuests"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.expectedGuests}
                  onChange={handleChange}
                  placeholder="הכנס מספר אורחים משוער"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מיקום החתונה
                </label>
                <input
                  type="text"
                  name="weddingLocation"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.weddingLocation}
                  onChange={handleChange}
                  placeholder="הכנס מיקום משוער"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תקציב משוער
                </label>
                <input
                  type="text"
                  name="budget"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="הכנס תקציב משוער"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  במה תרצו שנעזור לכם?
                </label>
                <div className="space-y-2">
                  {Object.keys(formData.preferences).map((preference) => (
                    <div key={preference} className="flex items-center">
                      <input
                        type="checkbox"
                        name={`preferences.${preference}`}
                        checked={formData.preferences[preference as keyof typeof formData.preferences]}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                      />
                      <label className="text-sm text-gray-700">
                        {preference === 'venue' && 'אולם אירועים'}
                        {preference === 'catering' && 'קייטרינג'}
                        {preference === 'photography' && 'צילום'}
                        {preference === 'music' && 'מוזיקה'}
                        {preference === 'design' && 'עיצוב'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'מעדכן...' : 'סיום והמשך'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 