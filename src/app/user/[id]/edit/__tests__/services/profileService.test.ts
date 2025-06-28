import { profileService } from '../../services/profileService';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ProfileService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('formatDateForInput', () => {
    it('should format date string correctly', () => {
      const dateString = '2024-06-15T10:30:00.000Z';
      const result = profileService.formatDateForInput(dateString);
      
      if (result !== '2024-06-15') {
        throw new Error(`Expected '2024-06-15', got '${result}'`);
      }
    });

    it('should return empty string for empty input', () => {
      const result = profileService.formatDateForInput('');
      
      if (result !== '') {
        throw new Error(`Expected empty string, got '${result}'`);
      }
    });
  });

  describe('createInitialFormData', () => {
    it('should create form data from user profile', () => {
      const userData = {
        _id: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        weddingDate: '2024-06-15',
        partnerName: 'Jane Doe',
        partnerPhone: '987654321',
        partnerEmail: 'jane@example.com',
        expectedGuests: '100',
        budget: '50000',
        venueType: 'garden' as const,
        timeOfDay: 'evening' as const,
        locationPreference: 'center' as const,
        preferences: {
          venue: true,
          catering: true,
          photography: false,
          music: true,
          design: false,
        },
      };

      const result = profileService.createInitialFormData(userData);
      
      // Basic validation
      if (!result) {
        throw new Error('Should return form data');
      }
      
      if (result.fullName !== 'John Doe') {
        throw new Error('Should preserve full name');
      }
      
      if (result.phone !== '123456789') {
        throw new Error('Should preserve phone');
      }
    });
  });

  describe('fetchUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockResponse = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      } as any);

      const result = await profileService.fetchUserProfile('user123');
      
      if (!result) {
        throw new Error('Should return user profile');
      }
      
      if (result._id !== 'user123') {
        throw new Error('Should return correct user');
      }
    });
  });

  describe('Service methods existence', () => {
    it('should have all required methods', () => {
      const requiredMethods = [
        'fetchUserProfile',
        'updateUserProfile',
        'invitePartner',
        'formatDateForInput',
        'createInitialFormData',
      ];

      requiredMethods.forEach(method => {
        if (typeof (profileService as any)[method] !== 'function') {
          throw new Error(`ProfileService should have ${method} method`);
        }
      });
    });
  });
}); 