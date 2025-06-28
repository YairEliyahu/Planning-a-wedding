import {
  UserProfile,
  ProfileFormData,
  InviteStatus,
  InvitePartnerRequest,
  ApiResponse,
  UserApiResponse,
  PreferenceKey,
} from '../../types/profile';

describe('Profile Types', () => {
  it('should be able to import UserProfile type', () => {
    const mockProfile: UserProfile = {
      _id: 'user123',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '123456789',
      weddingDate: '2024-06-15',
      partnerName: 'Jane Doe',
      partnerPhone: '987654321',
      expectedGuests: '100',
      budget: '50000',
      venueType: 'garden',
      timeOfDay: 'evening',
      locationPreference: 'center',
      preferences: {
        venue: true,
        catering: true,
        photography: false,
        music: true,
        design: false,
      },
    };
    
    if (!mockProfile._id) {
      throw new Error('UserProfile type should be properly defined');
    }
  });

  it('should be able to import ProfileFormData type', () => {
    const mockFormData: ProfileFormData = {
      fullName: 'John Doe',
      phone: '123456789',
      weddingDate: '2024-06-15',
      partnerName: 'Jane Doe',
      partnerPhone: '987654321',
      partnerEmail: 'jane@example.com',
      expectedGuests: '100',
      budget: '50000',
      venueType: 'garden',
      timeOfDay: 'evening',
      locationPreference: 'center',
      preferences: {
        venue: true,
        catering: true,
        photography: false,
        music: true,
        design: false,
      },
    };
    
    if (!mockFormData.fullName) {
      throw new Error('ProfileFormData type should be properly defined');
    }
  });

  it('should be able to import InviteStatus type', () => {
    const statuses: InviteStatus[] = ['idle', 'sending', 'sent', 'expired', 'accepted', 'error'];
    
    statuses.forEach(status => {
      const mockStatus: InviteStatus = status;
      if (!mockStatus) {
        throw new Error(`InviteStatus should include ${status}`);
      }
    });
  });

  it('should be able to import ApiResponse type', () => {
    const mockResponse: ApiResponse<UserProfile> = {
      success: true,
      data: {
        _id: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        weddingDate: '2024-06-15',
        partnerName: 'Jane Doe',
        partnerPhone: '987654321',
        expectedGuests: '100',
        budget: '50000',
        venueType: 'garden',
        timeOfDay: 'evening',
        locationPreference: 'center',
        preferences: {
          venue: true,
          catering: true,
          photography: false,
          music: true,
          design: false,
        },
      },
    };
    
    if (mockResponse.success !== true) {
      throw new Error('ApiResponse type should be properly defined');
    }
  });

  it('should be able to import UserApiResponse type', () => {
    const mockUserResponse: UserApiResponse = {
      user: {
        _id: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        weddingDate: '2024-06-15',
        partnerName: 'Jane Doe',
        partnerPhone: '987654321',
        expectedGuests: '100',
        budget: '50000',
        venueType: 'garden',
        timeOfDay: 'evening',
        locationPreference: 'center',
        preferences: {
          venue: true,
          catering: true,
          photography: false,
          music: true,
          design: false,
        },
      },
    };
    
    if (!mockUserResponse.user) {
      throw new Error('UserApiResponse type should be properly defined');
    }
  });

  it('should be able to import InvitePartnerRequest type', () => {
    const mockRequest: InvitePartnerRequest = {
      userId: 'user123',
      partnerEmail: 'partner@example.com',
    };
    
    if (!mockRequest.userId || !mockRequest.partnerEmail) {
      throw new Error('InvitePartnerRequest type should be properly defined');
    }
  });

  it('should be able to import PreferenceKey type', () => {
    const mockPreferenceKey: PreferenceKey = {
      venue: 'אולם אירועים',
      catering: 'קייטרינג',
      photography: 'צילום',
      music: 'מוזיקה',
      design: 'עיצוב',
    };
    
    if (!mockPreferenceKey.venue) {
      throw new Error('PreferenceKey type should be properly defined');
    }
  });
}); 