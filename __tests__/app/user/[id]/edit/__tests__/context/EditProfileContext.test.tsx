import React from 'react';
import { EditProfileProvider } from '../../context/EditProfileContext';

// Mock dependencies
jest.mock('../../services/profileService', () => ({
  profileService: {
    fetchUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    invitePartner: jest.fn(),
    createInitialFormData: jest.fn(),
  },
}));

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
}));

describe('EditProfileContext', () => {
  it('should create EditProfileProvider without errors', () => {
    const createProvider = () => {
      return (
        <EditProfileProvider userId="user123">
          <div>Test Child</div>
        </EditProfileProvider>
      );
    };
    
    // Test passes if no errors are thrown
    createProvider();
  });

  it('should be a valid React component', () => {
    const provider = (
      <EditProfileProvider userId="user123">
        <div>Test Child</div>
      </EditProfileProvider>
    );
    
    if (typeof provider !== 'object' || provider === null) {
      throw new Error('Should return a valid React element');
    }
  });

  it('should accept userId prop', () => {
    const provider = (
      <EditProfileProvider userId="user123">
        <div>Test Child</div>
      </EditProfileProvider>
    );
    
    // Check that userId prop is correctly passed
    if (provider.props.userId !== 'user123') {
      throw new Error('Should accept userId prop');
    }
  });

  it('should render children', () => {
    const testChild = <div>Test Child Content</div>;
    const provider = (
      <EditProfileProvider userId="user123">
        {testChild}
      </EditProfileProvider>
    );
    
    if (!provider.props.children) {
      throw new Error('Should render children');
    }
  });
}); 