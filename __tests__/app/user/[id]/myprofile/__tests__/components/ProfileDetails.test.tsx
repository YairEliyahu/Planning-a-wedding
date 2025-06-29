/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileDetails from '../../components/ProfileDetails';
import { mockUserProfile } from '../utils/mock-data';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProfileDetails Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders profile details correctly', () => {
    render(<ProfileDetails profile={mockUserProfile} />);

    const titleElement = screen.getByText('פרטי פרופיל');
    const nameElement = screen.getByText(mockUserProfile.fullName);
    const emailElement = screen.getByText(mockUserProfile.email);
    const phoneElement = screen.getByText(mockUserProfile.phoneNumber);
    const partnerNameElement = screen.getByText(mockUserProfile.partnerName);
    const partnerPhoneElement = screen.getByText(mockUserProfile.partnerPhone);
    const locationElement = screen.getByText(mockUserProfile.weddingLocation);
    
    if (!titleElement) throw new Error('Profile title not found');
    if (!nameElement) throw new Error('Full name not found');
    if (!emailElement) throw new Error('Email not found');
    if (!phoneElement) throw new Error('Phone number not found');
    if (!partnerNameElement) throw new Error('Partner name not found');
    if (!partnerPhoneElement) throw new Error('Partner phone not found');
    if (!locationElement) throw new Error('Wedding location not found');
  });

  it('displays wedding date in Hebrew format', () => {
    render(<ProfileDetails profile={mockUserProfile} />);
    
    const weddingDate = new Date(mockUserProfile.weddingDate).toLocaleDateString('he-IL');
    const dateElement = screen.getByText(weddingDate);
    if (!dateElement) throw new Error('Wedding date not found');
  });

  it('displays budget with proper formatting', () => {
    render(<ProfileDetails profile={mockUserProfile} />);
    
    const formattedBudget = `₪${parseInt(mockUserProfile.budget).toLocaleString()}`;
    const budgetElement = screen.getByText(formattedBudget);
    if (!budgetElement) throw new Error('Budget not found');
  });

  it('shows selected preferences with checkmarks', () => {
    render(<ProfileDetails profile={mockUserProfile} />);

    // Check that services with true preferences are shown
    if (mockUserProfile.preferences.venue) {
      const venueElement = screen.getByText('אולם אירועים');
      if (!venueElement) throw new Error('Venue preference not found');
    }
    if (mockUserProfile.preferences.catering) {
      const cateringElement = screen.getByText('קייטרינג');
      if (!cateringElement) throw new Error('Catering preference not found');
    }
    if (mockUserProfile.preferences.photography) {
      const photographyElement = screen.getByText('צילום');
      if (!photographyElement) throw new Error('Photography preference not found');
    }
    if (mockUserProfile.preferences.design) {
      const designElement = screen.getByText('עיצוב');
      if (!designElement) throw new Error('Design preference not found');
    }
  });

  it('navigates to edit profile when edit button is clicked', () => {
    render(<ProfileDetails profile={mockUserProfile} />);

    const editButton = screen.getByRole('button', { name: /ערוך פרופיל/i });
    fireEvent.click(editButton);

    if (mockPush.mock.calls.length === 0) throw new Error('Navigation function not called');
    const expectedUrl = `/user/${mockUserProfile._id}/edit`;
    if (mockPush.mock.calls[0][0] !== expectedUrl) {
      throw new Error(`Expected URL ${expectedUrl}, got ${mockPush.mock.calls[0][0]}`);
    }
  });

  it('shows password setup button for Google auth users', () => {
    const googleUserProfile = { ...mockUserProfile, authProvider: 'google' };
    render(<ProfileDetails profile={googleUserProfile} />);

    const passwordButton = screen.getByRole('button', { name: /הגדר סיסמה/i });
    if (!passwordButton) throw new Error('Password button not found');
  });

  it('navigates to password setup when password button is clicked', () => {
    const googleUserProfile = { ...mockUserProfile, authProvider: 'google' };
    render(<ProfileDetails profile={googleUserProfile} />);

    const passwordButton = screen.getByRole('button', { name: /הגדר סיסמה/i });
    fireEvent.click(passwordButton);

    if (mockPush.mock.calls.length === 0) throw new Error('Navigation function not called');
    const expectedUrl = `/set-password?email=${encodeURIComponent(googleUserProfile.email)}`;
    if (mockPush.mock.calls[0][0] !== expectedUrl) {
      throw new Error(`Expected URL ${expectedUrl}, got ${mockPush.mock.calls[0][0]}`);
    }
  });

  it('does not show password setup button for non-Google auth users', () => {
    const localUserProfile = { ...mockUserProfile, authProvider: 'local' };
    render(<ProfileDetails profile={localUserProfile} />);

    const passwordButton = screen.queryByRole('button', { name: /הגדר סיסמה/i });
    if (passwordButton !== null) throw new Error('Password button should not be shown for local auth');
  });

  it('renders responsive design classes', () => {
    const { container } = render(<ProfileDetails profile={mockUserProfile} />);

    // Check for responsive classes
    const gridColsElement = container.querySelector('.grid-cols-1');
    const lgGridColsElement = container.querySelector('.lg\\:grid-cols-2');
    const smFlexElement = container.querySelector('.sm\\:flex-row');
    
    if (!gridColsElement) throw new Error('Grid cols class not found');
    if (!lgGridColsElement) throw new Error('Large grid cols class not found');
    if (!smFlexElement) throw new Error('Small flex row class not found');
  });

  it('displays section headers with proper styling', () => {
    render(<ProfileDetails profile={mockUserProfile} />);

    const personalDetailsElement = screen.getByText('פרטים אישיים');
    const partnerDetailsElement = screen.getByText('פרטי בן/בת הזוג');
    const weddingDetailsElement = screen.getByText('פרטי החתונה');
    const servicesElement = screen.getByText('שירותים נדרשים');
    
    if (!personalDetailsElement) throw new Error('Personal details header not found');
    if (!partnerDetailsElement) throw new Error('Partner details header not found');
    if (!weddingDetailsElement) throw new Error('Wedding details header not found');
    if (!servicesElement) throw new Error('Services header not found');
  });
}); 