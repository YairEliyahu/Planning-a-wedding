'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '../components/LoadingSpinner';
import OSMPlacesAutocomplete from '../components/OSMPlacesAutocomplete';
import { Place } from '../components/OSMPlacesAutocomplete';

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
  const [isProfileBuilding, setIsProfileBuilding] = useState(false);
  const [error, setError] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inviteMessage, setInviteMessage] = useState('');
  const [locationData, setLocationData] = useState<Place | null>(null);
  const [weddingLocationData, setWeddingLocationData] = useState<Place | null>(null);

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    // Israeli phone formats:
    // Mobile: 05X-XXXXXXX (10 digits: 05 + 8 digits)
    // Landline: 0X-XXXXXXX (9 digits: 0 + area code + 7 digits)
    const cleanPhone = phone.replace(/[-\s]/g, '');
    const mobileRegex = /^05[0-9]{8}$/; // Mobile: 05 + 8 digits = 10 total
    const landlineRegex = /^0[2-4,8-9][0-9]{7}$/; // Landline: 0 + area code + 7 digits = 9 total
    
    return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
  };

  const validateIdNumber = (id: string): boolean => {
    const idRegex = /^[0-9]{9}$/;
    return idRegex.test(id);
  };

  const validateAge = (age: string): boolean => {
    if (!age) return true; // Age is optional
    const ageNum = parseInt(age);
    return ageNum >= 18 && ageNum <= 70;
  };

  const validateExpectedGuests = (guests: string): boolean => {
    if (!guests) return true; // Guests is optional
    const guestsNum = parseInt(guests);
    return !isNaN(guestsNum) && guestsNum >= 0 && guestsNum <= 2000;
  };

  const validateWeddingDate = (date: string): boolean => {
    if (!date) return false; // Wedding date is required
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return selectedDate >= today;
  };

  const validateStep3Fields = (): boolean => {
    if (!validateWeddingDate(formData.weddingDate)) {
      setError('תאריך חתונה הוא שדה חובה וחייב להיות תאריך עתידי');
      return false;
    }

    if (formData.expectedGuests && !validateExpectedGuests(formData.expectedGuests)) {
      setError('מספר אורחים חייב להיות בין 0-2000');
      return false;
    }

    return true;
  };

  const validateRequiredFields = (): boolean => {
    const requiredFields = ['fullName', 'gender', 'phone', 'idNumber'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      setError(`השדות הבאים הם חובה: ${missingFields.map(field => {
        switch(field) {
          case 'fullName': return 'שם מלא';
          case 'gender': return 'מגדר';
          case 'phone': return 'מספר טלפון';
          case 'idNumber': return 'תעודת זהות';
          default: return field;
        }
      }).join(', ')}`);
      return false;
    }

    if (!validatePhoneNumber(formData.phone)) {
      setError('מספר טלפון לא תקין (דוגמאות: 0501234567 או 026789012)');
      return false;
    }

    if (!validateIdNumber(formData.idNumber)) {
      setError('תעודת זהות חייבת להכיל 9 ספרות');
      return false;
    }

    // Validate age if provided
    if (formData.age && !validateAge(formData.age)) {
      setError('גיל חייב להיות בין 18-70');
      return false;
    }

    return true;
  };

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
            phone: data.user.phone || '',
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
    setIsProfileBuilding(true);
    setError('');

    // Validate step 3 fields before submitting
    if (!validateStep3Fields()) {
      setIsLoading(false);
      setIsProfileBuilding(false);
      return;
    }

    try {
      const formattedData = {
        ...formData,
        weddingDate: formData.weddingDate ? new Date(formData.weddingDate).toISOString() : undefined,
        expectedGuests: formData.expectedGuests ? Number(formData.expectedGuests) : undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        // Add location coordinates if available
        locationCoordinates: locationData ? {
          lat: locationData.lat,
          lon: locationData.lon
        } : undefined,
        // Add wedding location coordinates if available
        weddingLocationCoordinates: weddingLocationData ? {
          lat: weddingLocationData.lat,
          lon: weddingLocationData.lon
        } : undefined,
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

      if (data.user) {
        await login(localStorage.getItem('token') || '', data.user);
        router.push(`/user/${user?._id}`);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בעדכון פרופיל');
    } finally {
      setIsLoading(false);
      setIsProfileBuilding(false);
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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits for Israeli phone numbers (9-10 digits)
    // Mobile: 05XXXXXXXX (10 digits), Landline: 0XXXXXXXX (9 digits)
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      setFormData(prev => ({
        ...prev,
        phone: value
      }));
    }
  };

  const handleIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and limit to 9 characters
    if (/^[0-9]*$/.test(value) && value.length <= 9) {
      setFormData(prev => ({
        ...prev,
        idNumber: value
      }));
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and validate range
    if (/^[0-9]*$/.test(value)) {
      const ageNum = parseInt(value);
      if (value === '' || (ageNum >= 1 && ageNum <= 99)) { // Allow typing, but validate on blur
        setFormData(prev => ({
          ...prev,
          age: value
        }));
      }
    }
  };

  const handleAgeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !validateAge(value)) {
      setError('גיל חייב להיות בין 18-70');
    } else {
      setError(''); // Clear error if age is valid
    }
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      location: value
    }));
  };

  const handleSelectPlace = (place: Place) => {
    setLocationData(place);
    setFormData(prev => ({
      ...prev,
      location: place.display_name
    }));
  };

  const handleExpectedGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and enforce max 2000
    if (/^[0-9]*$/.test(value) && (value === '' || parseInt(value) <= 2000)) {
      setFormData(prev => ({
        ...prev,
        expectedGuests: value
      }));
    }
  };

  const handleWeddingLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      weddingLocation: value
    }));
  };

  const handleSelectWeddingPlace = (place: Place) => {
    setWeddingLocationData(place);
    setFormData(prev => ({
      ...prev,
      weddingLocation: place.display_name
    }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateRequiredFields()) {
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // Clear any previous errors
    setError('');
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipPartnerDetails = () => {
    // Clear partner details when skipping
    setFormData(prev => ({
      ...prev,
      partnerName: '',
      partnerEmail: '',
      partnerPhone: '',
      partnerIdNumber: '',
      partnerGender: ''
    }));
    
    // Clear any previous errors
    setError('');
    
    // Show success message
    setInviteStatus('idle');
    setInviteMessage('');
    
    setCurrentStep(3); // Skip to step 3
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
        text={isProfileBuilding ? 'בניית פרופיל...' : 'טוען...'} 
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
          <div className="animate-fade-in-up space-y-enhanced-lg">
            <div className="mb-8">
              <h2 className="heading-primary text-4xl mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📝 פרטים אישיים
              </h2>
              <p className="text-gray-600 text-lg">בואו נכיר אותך טוב יותר</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="form-label-enhanced">
                  <span className="text-red-500">*</span>
                  <span>👤 שם מלא</span>
                </Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  className="form-input-enhanced"
                  placeholder="הזן את שמך המלא"
                  required 
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="form-label-enhanced">
                  <span className="text-red-500">*</span>
                  <span>📧 אימייל</span>
                </Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="form-input-enhanced bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="age" className="form-label-enhanced">
                  <span>🎂 גיל (18-70)</span>
                </Label>
                <Input 
                  id="age" 
                  name="age" 
                  type="number" 
                  min="18"
                  max="70"
                  value={formData.age} 
                  onChange={handleAgeChange}
                  onBlur={handleAgeBlur}
                  className="form-input-enhanced"
                  placeholder="הזן גיל בין 18-70"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="gender" className="form-label-enhanced">
                  <span className="text-red-500">*</span>
                  <span>⚧ מגדר</span>
                </Label>
                <select 
                  id="gender" 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="form-input-enhanced"
                  required
                >
                  <option value="">בחר/י מגדר</option>
                  <option value="Male">זכר</option>
                  <option value="Female">נקבה</option>
                  <option value="Other">אחר</option>
                </select>
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="location" className="form-label-enhanced">
                  <span>📍 מיקום מגורים</span>
                </Label>
                <div className="relative">
                  <OSMPlacesAutocomplete
                    value={formData.location}
                    onChange={handleLocationChange}
                    onSelect={handleSelectPlace}
                    placeholder="🔍 הזן מיקום מגורים (אופציונלי)"
                    className="form-input-enhanced"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="phone" className="form-label-enhanced">
                  <span className="text-red-500">*</span>
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
                  required 
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="idNumber" className="form-label-enhanced">
                  <span className="text-red-500">*</span>
                  <span>🆔 תעודת זהות</span>
                </Label>
                <Input 
                  id="idNumber" 
                  name="idNumber" 
                  value={formData.idNumber} 
                  onChange={handleIdNumberChange}
                  className="form-input-enhanced"
                  placeholder="מספר תעודת זהות (9 ספרות)"
                  required 
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="animate-fade-in-up space-y-enhanced-lg">
            <div className="mb-8">
              <h2 className="heading-primary text-4xl mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                💕 פרטי בן/ת הזוג
              </h2>
              <p className="text-gray-600 text-lg">בואו נכיר גם את בן/בת הזוג שלך</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="partnerName" className="form-label-enhanced">
                  <span>👤 שם בן/בת הזוג</span>
                </Label>
                <Input
                  id="partnerName"
                  name="partnerName"
                  value={formData.partnerName}
                  onChange={handleChange}
                  className="form-input-enhanced"
                  placeholder="הזן את שם בן/בת הזוג"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="partnerEmail" className="form-label-enhanced">
                  <span>📧 אימייל</span>
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="partnerEmail"
                    name="partnerEmail"
                    type="email"
                    value={formData.partnerEmail}
                    onChange={handleChange}
                    className="form-input-enhanced flex-1"
                    placeholder="אימייל של בן/בת הזוג"
                  />
                  <Button 
                    type="button" 
                    onClick={handleInvitePartner} 
                    disabled={inviteStatus === 'sending' || inviteStatus === 'sent' || !formData.partnerEmail}
                    className="btn-primary whitespace-nowrap"
                  >
                    {inviteStatus === 'sending' ? 'שולח...' : 'הזמן לשיתוף'}
                  </Button>
                </div>
                {inviteStatus === 'sent' && (
                  <div className="success-message-enhanced flex items-center gap-2">
                    <span>✅</span>
                    <span>{inviteMessage}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="partnerPhone" className="form-label-enhanced">
                  <span>📱 טלפון</span>
                </Label>
                <Input
                  id="partnerPhone"
                  name="partnerPhone"
                  type="tel"
                  value={formData.partnerPhone}
                  onChange={handleChange}
                  className="form-input-enhanced"
                  placeholder="מספר טלפון של בן/בת הזוג"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="partnerIdNumber" className="form-label-enhanced">
                  <span>🆔 תעודת זהות</span>
                </Label>
                <Input
                  id="partnerIdNumber"
                  name="partnerIdNumber"
                  value={formData.partnerIdNumber}
                  onChange={handleChange}
                  className="form-input-enhanced"
                  placeholder="תעודת זהות של בן/בת הזוג"
                />
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="partnerGender" className="form-label-enhanced">
                  <span>⚧ מגדר</span>
                </Label>
                <select
                  id="partnerGender"
                  name="partnerGender"
                  value={formData.partnerGender}
                  onChange={handleChange}
                  className="form-input-enhanced"
                >
                  <option value="">בחר מגדר</option>
                  <option value="Male">זכר</option>
                  <option value="Female">נקבה</option>
                  <option value="Other">אחר</option>
                </select>
              </div>
            </div>
            
            <div className="feature-card">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2 text-lg">
                <span>🤝</span>
                גישה משותפת לחשבון
              </h3>
              <p className="text-blue-700 mb-3 leading-relaxed">
                הזמנת בן/בת הזוג תאפשר גישה משותפת לחשבון זה.
                {inviteStatus !== 'sent' && ' הקליקו על \'הזמן לשיתוף\' לאחר הזנת האימייל.'}
              </p>
              {inviteStatus === 'sent' && (
                <p className="text-blue-700 leading-relaxed">
                  בן/בת הזוג יקבלו מייל עם הוראות לכניסה לחשבון. אם אין להם חשבון קיים, הם יתבקשו להירשם תחילה.
                </p>
              )}
            </div>
            
            {/* אפשרות לדלג על השלב */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-4">לא רוצה להוסיף בן/בת זוג כרגע?</p>
              <Button 
                type="button" 
                onClick={handleSkipPartnerDetails}
                variant="outline"
                className="btn-secondary"
              >
                דלג על שלב זה ←
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="animate-fade-in-up space-y-enhanced-lg">
            <div className="mb-8">
              <h2 className="heading-primary text-4xl mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                💒 פרטי החתונה
              </h2>
              <p className="text-gray-600 text-lg">ספרו לנו על החתונה החלומית שלכם</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="weddingDate" className="form-label-enhanced">
                  <span>📅 תאריך חתונה *</span>
                </Label>
                <Input
                  id="weddingDate"
                  name="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={handleChange}
                  className="form-input-enhanced"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="expectedGuests" className="form-label-enhanced">
                  <span>👥 מספר אורחים משוער</span>
                </Label>
                <Input
                  id="expectedGuests"
                  name="expectedGuests"
                  type="number"
                  min="0"
                  max="2000"
                  placeholder="0-2000 אורחים"
                  value={formData.expectedGuests}
                  onChange={handleExpectedGuestsChange}
                  className="form-input-enhanced"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="weddingLocation" className="form-label-enhanced">
                  <span>📍 מיקום החתונה</span>
                </Label>
                <OSMPlacesAutocomplete
                  value={formData.weddingLocation}
                  onChange={handleWeddingLocationChange}
                  onSelect={handleSelectWeddingPlace}
                  placeholder="חפש מיקום לחתונה..."
                  className="form-input-enhanced"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="budget" className="form-label-enhanced">
                  <span>💰 תקציב משוער</span>
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="text"
                  placeholder="מה התקציב שלכם?"
                  value={formData.budget}
                  onChange={handleChange}
                  className="form-input-enhanced"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="venueType" className="form-label-enhanced">
                  <span>🏛️ סוג המקום</span>
                </Label>
                <select
                  id="venueType"
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleChange}
                  className="form-input-enhanced"
                >
                  <option value="">בחר את סוג המקום</option>
                  <option value="garden">גן אירועים</option>
                  <option value="nature">אירוע בטבע</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="timeOfDay" className="form-label-enhanced">
                  <span>🕐 שעת האירוע</span>
                </Label>
                <select
                  id="timeOfDay"
                  name="timeOfDay"
                  value={formData.timeOfDay}
                  onChange={handleChange}
                  className="form-input-enhanced"
                >
                  <option value="">בחר את שעת האירוע</option>
                  <option value="evening">חתונת ערב</option>
                  <option value="afternoon">חתונת צהריים</option>
                </select>
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="locationPreference" className="form-label-enhanced">
                  <span>🗺️ אזור בארץ</span>
                </Label>
                <select
                  id="locationPreference"
                  name="locationPreference"
                  value={formData.locationPreference}
                  onChange={handleChange}
                  className="form-input-enhanced"
                >
                  <option value="">בחר את האזור המועדף</option>
                  <option value="south">דרום</option>
                  <option value="center">מרכז</option>
                  <option value="north">צפון</option>
                </select>
              </div>
            </div>
            
            <div className="feature-card">
              <Label className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span>🛠️</span>
                במה תרצו שנעזור לכם?
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(formData.preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
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
                      className="w-5 h-5"
                    />
                    <Label htmlFor={key} className="text-sm font-medium cursor-pointer flex-1">
                      {key === 'venue' && '🏛️ אולם אירועים'}
                      {key === 'catering' && '🍽️ קייטרינג'}
                      {key === 'photography' && '📸 צילום'}
                      {key === 'music' && '🎵 מוזיקה'}
                      {key === 'design' && '🎨 עיצוב'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {user?.isProfileComplete && <Navbar />}
      
      <div className={`min-h-screen flex flex-col items-center ${user?.isProfileComplete ? 'pt-24' : 'justify-center'} py-16 px-6`}>
        {/* Header משופר */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mb-6 shadow-xl animate-pulse-gentle">
            <span className="text-4xl">💒</span>
          </div>
          <h1 className="heading-primary text-5xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            השלמת פרטי חתונה
          </h1>
          <p className="text-gray-600 text-xl leading-relaxed max-w-2xl mx-auto">
            נשמח לדעת עוד פרטים על החתונה שלכם ✨ בואו ניצור יחד את האירוע המושלם
          </p>
        </div>

        <Card className="card-enhanced w-full max-w-6xl">
          <CardContent className="grid lg:grid-cols-[380px_1fr] gap-0 p-0 min-h-[700px]">
            {/* Steps Sidebar משופר */}
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8 flex flex-col justify-between min-h-full">
              <div className="space-y-8">
                <div className="text-center pb-6 border-b border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-xl">
                    שלבי השלמת הפרופיל
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    {currentStep}/3 שלבים הושלמו
                  </p>
                </div>
                
                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  {/* Step 1 */}
                  <div className={`relative transition-all duration-500 ${
                    currentStep > 1 ? 'step-item-enhanced completed scale-95' : 
                    currentStep === 1 ? 'step-item-enhanced current scale-105' : 
                    'step-item-enhanced opacity-60'
                  }`}>
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {currentStep > 1 ? '✓' : '1'}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md border-r-4 border-blue-500 mr-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">👤</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">פרטים אישיים</h4>
                          <p className="text-gray-600 text-sm">המידע שלך</p>
                          {currentStep > 1 && (
                            <div className="flex items-center gap-1 mt-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-green-600 text-xs font-medium">הושלם</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`relative transition-all duration-500 ${
                    currentStep > 2 ? 'step-item-enhanced completed scale-95' : 
                    currentStep === 2 ? 'step-item-enhanced current scale-105' : 
                    'step-item-enhanced opacity-60'
                  }`}>
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {currentStep > 2 ? '✓' : '2'}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md border-r-4 border-pink-500 mr-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">💕</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">בן/בת הזוג</h4>
                          <p className="text-gray-600 text-sm">פרטי השותף/ה</p>
                          {currentStep > 2 && (
                            <div className="flex items-center gap-1 mt-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-green-600 text-xs font-medium">הושלם</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`relative transition-all duration-500 ${
                    currentStep === 3 ? 'step-item-enhanced current scale-105' : 
                    'step-item-enhanced opacity-60'
                  }`}>
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md border-r-4 border-purple-500 mr-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">💒</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">פרטי החתונה</h4>
                          <p className="text-gray-600 text-sm">מידע על האירוע</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center mb-4">
                  <span className="text-sm font-medium text-gray-600">התקדמות</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700 ease-out"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500">{Math.round((currentStep / 3) * 100)}% הושלם</span>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-10 flex flex-col justify-center min-h-full">
              <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto w-full">
                {renderStep()}

                {/* Navigation Buttons משופרים */}
                <div className="flex justify-between pt-10 border-t-2 border-gray-100">
                  {currentStep > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="btn-secondary flex items-center gap-3 text-lg px-8 py-4"
                    >
                      הקודם →
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button 
                      type="button" 
                      onClick={nextStep} 
                      className={`btn-primary flex items-center gap-3 text-lg px-8 py-4 ${currentStep === 1 ? 'mr-auto' : ''}`}
                    >
                      ← הבא
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="btn-primary mr-auto flex items-center gap-3 text-lg px-8 py-4"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          {isProfileBuilding ? 'בונה פרופיל...' : 'מעדכן...'}
                        </>
                      ) : (
                        <>
                          ✅ סיום והמשך
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>

              {/* Error Message משופר */}
              {error && (
                <div className="error-message-enhanced animate-fade-in-up mt-6">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

