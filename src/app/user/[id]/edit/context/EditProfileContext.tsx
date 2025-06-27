'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserProfile, ProfileFormData, InviteStatus } from '../types/profile';
import profileService from '../services/profileService';

interface EditProfileContextType {
  // Query data
  profile: UserProfile | null;
  isProfileLoading: boolean;
  profileError: Error | null;
  
  // Form state
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  
  // Invite state
  inviteStatus: InviteStatus;
  inviteMessage: string;
  
  // Messages
  successMessage: string;
  errorMessage: string;
  
  // Actions
  updateProfile: () => void;
  invitePartner: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handlePreferenceChange: (key: keyof ProfileFormData['preferences']) => void;
  clearMessages: () => void;
  
  // Loading states
  isUpdating: boolean;
  isInviting: boolean;
  
  // Refetch
  refetchProfile: () => void;
}

const EditProfileContext = createContext<EditProfileContextType | undefined>(undefined);

interface EditProfileProviderProps {
  children: ReactNode;
  userId: string;
}

const createInitialFormData = (): ProfileFormData => ({
  fullName: '',
  phone: '',
  weddingDate: '',
  partnerName: '',
  partnerPhone: '',
  partnerEmail: '',
  expectedGuests: '',
  budget: '',
  venueType: '',
  timeOfDay: '',
  locationPreference: '',
  preferences: {
    venue: false,
    catering: false,
    photography: false,
    music: false,
    design: false,
  },
});

export function EditProfileProvider({ children, userId }: EditProfileProviderProps) {
  const queryClient = useQueryClient();
  
  // Local state
  const [formData, setFormData] = useState<ProfileFormData>(createInitialFormData);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>('idle');
  const [inviteMessage, setInviteMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Query for user profile
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => profileService.fetchUserProfile(userId),
    enabled: !!userId,
  });

  // Handle profile data changes
  React.useEffect(() => {
    if (profile) {
      // Initialize form data when profile loads
      const initialFormData = profileService.createInitialFormData(profile);
      setFormData(initialFormData);
      
      // Set invitation status
      if (profile.partnerInviteAccepted) {
        setInviteStatus('accepted');
        setInviteMessage(`${profile.partnerName || 'השותף/ה'} כבר מחובר/ת לחשבון`);
      } else if (profile.partnerInvitePending) {
        setInviteStatus('sent');
        setInviteMessage(`הזמנה נשלחה ל-${profile.partnerEmail}`);
      } else {
        setInviteStatus('idle');
      }
    }
  }, [profile]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => profileService.updateUserProfile(userId, data),
    onSuccess: (updatedProfile: UserProfile) => {
      // Update cache
      queryClient.setQueryData(['userProfile', userId], updatedProfile);
      setSuccessMessage('הפרופיל עודכן בהצלחה!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || 'עדכון הפרופיל נכשל');
    },
  });

  // Mutation for inviting partner
  const invitePartnerMutation = useMutation({
    mutationFn: () => profileService.invitePartner({
      userId,
      partnerEmail: formData.partnerEmail,
    }),
    onMutate: () => {
      setInviteStatus('sending');
      setErrorMessage('');
      setSuccessMessage('');
    },
    onSuccess: () => {
      setInviteStatus('sent');
      setInviteMessage(`הזמנה נשלחה ל-${formData.partnerEmail}`);
      setSuccessMessage('הזמנה נשלחה בהצלחה!');
      
      // Refetch profile to get updated invitation status
      refetchProfile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: Error) => {
      setInviteStatus('error');
      setErrorMessage(error.message || 'שליחת ההזמנה נכשלה');
    },
  });

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (key: keyof ProfileFormData['preferences']) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
    }));
  };

  const updateProfile = () => {
    setErrorMessage('');
    setSuccessMessage('');
    updateProfileMutation.mutate(formData);
  };

  const invitePartner = () => {
    if (!formData.partnerEmail) {
      setErrorMessage('אנא הזן את כתובת האימייל של בן/בת הזוג');
      return;
    }
    invitePartnerMutation.mutate();
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const contextValue: EditProfileContextType = {
    // Query data
    profile: profile as UserProfile | null,
    isProfileLoading,
    profileError: profileError as Error | null,
    
    // Form state
    formData,
    setFormData,
    
    // Invite state
    inviteStatus,
    inviteMessage,
    
    // Messages
    successMessage,
    errorMessage,
    
    // Actions
    updateProfile,
    invitePartner,
    handleChange,
    handlePreferenceChange,
    clearMessages,
    
    // Loading states
    isUpdating: updateProfileMutation.isPending,
    isInviting: invitePartnerMutation.isPending,
    
    // Refetch
    refetchProfile,
  };

  return (
    <EditProfileContext.Provider value={contextValue}>
      {children}
    </EditProfileContext.Provider>
  );
}

export function useEditProfile() {
  const context = useContext(EditProfileContext);
  if (context === undefined) {
    throw new Error('useEditProfile must be used within an EditProfileProvider');
  }
  return context;
} 