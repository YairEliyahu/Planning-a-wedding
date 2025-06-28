export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  gender?: string;
  partnerName?: string;
  partnerGender?: string;
  weddingDate?: string;
  expectedGuests?: string;
  budget?: string;
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  locationPreference: 'south' | 'center' | 'north' | '';
  preferences?: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  connectedUserId?: string;
}

export interface WeddingPreferences {
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  locationPreference: 'south' | 'center' | 'north' | '';
  guestsCount: string;
}

export interface WeddingPreferencesAPI {
  venueType: 'garden' | 'nature' | '';
  timeOfDay: 'evening' | 'afternoon' | '';
  locationPreference: 'south' | 'center' | 'north' | '';
}

export interface UserUpdateRequest {
  expectedGuests: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserProfileResponse {
  user: UserProfile;
}

export interface WeddingPreferencesResponse {
  preferences: WeddingPreferencesAPI;
}

export type VenueTypeOption = {
  value: 'garden' | 'nature';
  label: string;
};

export type TimeOfDayOption = {
  value: 'evening' | 'afternoon';
  label: string;
};

export type LocationPreferenceOption = {
  value: 'south' | 'center' | 'north';
  label: string;
};

// Form validation types
export interface WeddingFormErrors {
  venueType?: string;
  timeOfDay?: string;
  locationPreference?: string;
  guestsCount?: string;
}

// Context state types
export interface WeddingContextState {
  profile: UserProfile | null;
  preferences: WeddingPreferences;
  savedPreferences: WeddingPreferences | null;
  isLoading: boolean;
  error: string;
}

export interface WeddingContextActions {
  updatePreferences: (preferences: Partial<WeddingPreferences>) => void;
  savePreferences: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface WeddingContextValue extends WeddingContextState, WeddingContextActions {} 