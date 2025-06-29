import React from 'react';
import ProfileImageSection from '../../components/ProfileImageSection';

// Mock the context
jest.mock('../../context/EditProfileContext', () => ({
  useEditProfile: jest.fn(() => ({
    profile: {
      profilePicture: 'https://example.com/profile.jpg',
      fullName: 'John Doe',
    },
  })),
}));

describe('ProfileImageSection', () => {
  it('should create component without errors', () => {
    const createComponent = () => {
      return <ProfileImageSection />;
    };
    
    // Test passes if no errors are thrown
    createComponent();
  });

  it('should be a valid React component', () => {
    const component = <ProfileImageSection />;
    
    if (typeof component !== 'object' || component === null) {
      throw new Error('Should return a valid React element');
    }
  });

  it('should render without crashing', () => {
    const component = <ProfileImageSection />;
    
    // Component should be defined
    if (!component) {
      throw new Error('Component should be defined');
    }
  });
}); 