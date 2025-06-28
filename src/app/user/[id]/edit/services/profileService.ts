import { UserProfile, ProfileFormData, InvitePartnerRequest, UserApiResponse } from '../types/profile';

class ProfileService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async fetchUserProfile(userId: string): Promise<UserProfile> {
    const response = await fetch(`/api/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: UserApiResponse = await this.handleResponse(response);
    return data.user;
  }

  async updateUserProfile(userId: string, formData: ProfileFormData): Promise<UserProfile> {
    const response = await fetch(`/api/user/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data: UserApiResponse = await this.handleResponse(response);
    return data.user;
  }

  async invitePartner(request: InvitePartnerRequest): Promise<{ message: string }> {
    const response = await fetch('/api/invite-partner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return this.handleResponse(response);
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  }

  createInitialFormData(userData: UserProfile): ProfileFormData {
    return {
      fullName: userData.fullName || '',
      phone: userData.phone || '',
      weddingDate: this.formatDateForInput(userData.weddingDate),
      partnerName: userData.partnerName || '',
      partnerPhone: userData.partnerPhone || '',
      partnerEmail: userData.partnerEmail || '',
      expectedGuests: userData.expectedGuests || '',
      budget: userData.budget || '',
      venueType: userData.venueType || '',
      timeOfDay: userData.timeOfDay || '',
      locationPreference: userData.locationPreference || '',
      preferences: {
        venue: Boolean(userData.preferences?.venue),
        catering: Boolean(userData.preferences?.catering),
        photography: Boolean(userData.preferences?.photography),
        music: Boolean(userData.preferences?.music),
        design: Boolean(userData.preferences?.design),
      },
    };
  }
}

export const profileService = new ProfileService();
export default profileService; 