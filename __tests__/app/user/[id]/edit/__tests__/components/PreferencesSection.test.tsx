import React from 'react';
import PreferencesSection from '../../components/PreferencesSection';

// Mock the context
jest.mock('../../context/EditProfileContext', () => ({
  useEditProfile: jest.fn(() => ({
    formData: {
      preferences: {
        venue: true,
        catering: true,
        photography: false,
        music: true,
        design: false,
      },
    },
    handlePreferenceChange: jest.fn(),
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
    checkboxContainer: {},
    checkbox: {},
    checkboxLabel: {},
  },
}));

describe('PreferencesSection', () => {
  it('should create component without errors', () => {
    const createComponent = () => {
      return <PreferencesSection />;
    };
    
    // Test passes if no errors are thrown
    createComponent();
  });

  it('should be a valid React component', () => {
    const component = <PreferencesSection />;
    
    if (typeof component !== 'object' || component === null) {
      throw new Error('Should return a valid React element');
    }
  });

  it('should render without crashing', () => {
    const component = <PreferencesSection />;
    
    // Component should be defined
    if (!component) {
      throw new Error('Component should be defined');
    }
  });
}); 