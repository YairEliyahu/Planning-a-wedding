import { 
  UserProfile, 
  WeddingPreferences, 
  WeddingPreferencesAPI,
  UserUpdateRequest,
  UserProfileResponse,
  WeddingPreferencesResponse 
} from '../types/wedding.types';

class WeddingService {
  private baseUrl = '/api';

  /**
   * Fetch user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }
    
    const data: UserProfileResponse = await response.json();
    return data.user;
  }

  /**
   * Update user profile (guests count)
   */
  async updateUserProfile(userId: string, updateData: UserUpdateRequest): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.statusText}`);
    }

    const data: UserProfileResponse = await response.json();
    return data.user;
  }

  /**
   * Fetch wedding preferences by user ID
   */
  async getWeddingPreferences(userId: string): Promise<WeddingPreferencesAPI | null> {
    const response = await fetch(`${this.baseUrl}/wedding-preferences/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No preferences found - return null
        return null;
      }
      throw new Error(`Failed to fetch wedding preferences: ${response.statusText}`);
    }
    
    const data: WeddingPreferencesResponse = await response.json();
    return data.preferences;
  }

  /**
   * Save wedding preferences
   */
  async saveWeddingPreferences(userId: string, preferences: WeddingPreferencesAPI): Promise<WeddingPreferencesAPI> {
    const response = await fetch(`${this.baseUrl}/wedding-preferences/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error(`Failed to save wedding preferences: ${response.statusText}`);
    }

    const data: WeddingPreferencesResponse = await response.json();
    return data.preferences;
  }

  /**
   * Combined method to fetch both profile and preferences
   */
  async getWeddingData(userId: string): Promise<{
    profile: UserProfile;
    preferences: WeddingPreferences;
  }> {
    try {
      // Fetch both profile and preferences in parallel
      const [profile, weddingPreferences] = await Promise.all([
        this.getUserProfile(userId),
        this.getWeddingPreferences(userId),
      ]);

      // Combine data from profile and wedding preferences
      const combinedPreferences: WeddingPreferences = {
        venueType: weddingPreferences?.venueType || profile.venueType || '',
        timeOfDay: weddingPreferences?.timeOfDay || profile.timeOfDay || '',
        locationPreference: weddingPreferences?.locationPreference || profile.locationPreference || '',
        guestsCount: profile.expectedGuests || '',
      };

      return {
        profile,
        preferences: combinedPreferences,
      };
    } catch (error) {
      console.error('Failed to fetch wedding data:', error);
      throw error;
    }
  }

  /**
   * Save all wedding data (profile + preferences)
   */
  async saveWeddingData(userId: string, preferences: WeddingPreferences): Promise<{
    profile: UserProfile;
    preferences: WeddingPreferencesAPI;
  }> {
    try {
      // Update user profile and wedding preferences in parallel
      const [updatedProfile, updatedPreferences] = await Promise.all([
        this.updateUserProfile(userId, { expectedGuests: preferences.guestsCount }),
        this.saveWeddingPreferences(userId, {
          venueType: preferences.venueType,
          timeOfDay: preferences.timeOfDay,
          locationPreference: preferences.locationPreference,
        }),
      ]);

      return {
        profile: updatedProfile,
        preferences: updatedPreferences,
      };
    } catch (error) {
      console.error('Failed to save wedding data:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const weddingService = new WeddingService();
export default weddingService; 