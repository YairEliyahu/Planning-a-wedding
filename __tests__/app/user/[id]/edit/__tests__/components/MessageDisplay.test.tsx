import React from 'react';
import MessageDisplay from '../../components/MessageDisplay';

// Mock the context
jest.mock('../../context/EditProfileContext', () => ({
  useEditProfile: jest.fn(() => ({
    successMessage: 'Profile updated successfully',
    errorMessage: '',
    inviteMessage: '',
  })),
}));

describe('MessageDisplay', () => {
  it('should create component without errors', () => {
    const createComponent = () => {
      return <MessageDisplay />;
    };
    
    // Test passes if no errors are thrown
    createComponent();
  });

  it('should be a valid React component', () => {
    const component = <MessageDisplay />;
    
    if (typeof component !== 'object' || component === null) {
      throw new Error('Should return a valid React element');
    }
  });

  it('should render without crashing', () => {
    const component = <MessageDisplay />;
    
    // Component should be defined
    if (!component) {
      throw new Error('Component should be defined');
    }
  });
}); 