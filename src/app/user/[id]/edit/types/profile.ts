export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  weddingDate: string;
  partnerName: string;
  partnerPhone: string;
  partnerEmail?: string;
  expectedGuests: string;
  budget: string;
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  locationPreference: 'south' | 'center' | 'north' | '';
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  authProvider?: string;
  profilePicture?: string;
  partnerInvitePending?: boolean;
  partnerInviteAccepted?: boolean;
}

export interface ProfileFormData {
  fullName: string;
  phone: string;
  weddingDate: string;
  partnerName: string;
  partnerPhone: string;
  partnerEmail: string;
  expectedGuests: string;
  budget: string;
  venueType: string;
  timeOfDay: string;
  locationPreference: string;
  preferences: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
}

export type InviteStatus = 'idle' | 'sending' | 'sent' | 'expired' | 'accepted' | 'error';

export interface InvitePartnerRequest {
  userId: string;
  partnerEmail: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserApiResponse {
  user: UserProfile;
}

export interface PreferenceKey {
  venue: 'אולם אירועים';
  catering: 'קייטרינג';
  photography: 'צילום';
  music: 'מוזיקה';
  design: 'עיצוב';
} 