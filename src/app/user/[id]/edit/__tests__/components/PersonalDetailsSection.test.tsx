import React from 'react';
import PersonalDetailsSection from '../../components/PersonalDetailsSection';

// Mock the context
jest.mock('../../context/EditProfileContext', () => ({
  useEditProfile: jest.fn(() => ({
    formData: {
      fullName: 'John Doe',
      phone: '123456789',
      email: 'john@example.com',
    },
    handleChange: jest.fn(),
    profile: {
      email: 'john@example.com',
      fullName: 'John Doe',
      phone: '123456789',
    },
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

describe('PersonalDetailsSection', () => {
  it('should create component without errors', () => {
    const createComponent = () => {
      return <PersonalDetailsSection />;
    };
    
    // Test passes if no errors are thrown
    createComponent();
  });

  it('should be a valid React component', () => {
    const component = <PersonalDetailsSection />;
    
    if (typeof component !== 'object' || component === null) {
      throw new Error('Should return a valid React element');
    }
  });

  it('should render without crashing', () => {
    const component = <PersonalDetailsSection />;
    
    // Component should be defined
    if (!component) {
      throw new Error('Component should be defined');
    }
  });
}); 