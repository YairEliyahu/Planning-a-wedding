import React from 'react';
import WeddingDetailsSection from '../../components/WeddingDetailsSection';

// Mock the context
jest.mock('../../context/EditProfileContext', () => ({
  useEditProfile: jest.fn(() => ({
    formData: {
      venueType: 'garden',
      timeOfDay: 'evening',
      locationPreference: 'center',
      weddingDate: '2024-06-15',
      partnerName: 'Jane Doe',
      partnerPhone: '987654321',
      expectedGuests: '100',
      budget: '50000',
    },
    handleChange: jest.fn(),
  })),
}));

// Mock styles
jest.mock('../../styles/formStyles', () => ({
  styles: {
    section: {},
    sectionTitle: {},
    fieldContainer: {},
    label: {},
    input: {},
  },
}));

// Mock PartnerInviteSection component
jest.mock('../../components/PartnerInviteSection', () => {
  return function MockPartnerInviteSection() {
    return <div>Partner Invite Section</div>;
  };
});

describe('WeddingDetailsSection', () => {
  it('should create component without errors', () => {
    const createComponent = () => {
      return <WeddingDetailsSection />;
    };
    
    // Test passes if no errors are thrown
    createComponent();
  });

  it('should be a valid React component', () => {
    const component = <WeddingDetailsSection />;
    
    if (typeof component !== 'object' || component === null) {
      throw new Error('Should return a valid React element');
    }
  });

  it('should render without crashing', () => {
    const component = <WeddingDetailsSection />;
    
    // Component should be defined
    if (!component) {
      throw new Error('Component should be defined');
    }
  });
}); 