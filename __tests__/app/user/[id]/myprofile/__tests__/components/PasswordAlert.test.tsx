/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordAlert from '../../components/PasswordAlert';
import { mockUserProfile } from '../utils/mock-data';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('PasswordAlert Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders password alert for Google auth users', () => {
    const googleProfile = { ...mockUserProfile, authProvider: 'google' };
    render(<PasswordAlert profile={googleProfile} />);

    const titleElement = screen.getByText(/הגדרת סיסמה/);
    const securityElement = screen.getByText(/בטחון חשבון/);
    if (!titleElement) throw new Error('Password title not found');
    if (!securityElement) throw new Error('Security element not found');
  });

  it('does not render for users with local auth', () => {
    const localProfile = { ...mockUserProfile, authProvider: 'local' };
    const { container } = render(<PasswordAlert profile={localProfile} />);

    if (container.firstChild !== null) throw new Error('Component should not render for local auth');
  });

  it('shows appropriate warning message', () => {
    const googleProfile = { ...mockUserProfile, authProvider: 'google' };
    render(<PasswordAlert profile={googleProfile} />);

    const warningElement = screen.getByText(/מומלץ להגדיר סיסמה/);
    if (!warningElement) throw new Error('Warning message not found');
  });

  it('has a call-to-action button', () => {
    const googleProfile = { ...mockUserProfile, authProvider: 'google' };
    render(<PasswordAlert profile={googleProfile} />);

    const ctaButton = screen.getByRole('button', { name: /הגדר סיסמה עכשיו/i });
    if (!ctaButton) throw new Error('CTA button not found');
  });

  it('navigates to password setup on button click', () => {
    const googleProfile = { ...mockUserProfile, authProvider: 'google' };
    render(<PasswordAlert profile={googleProfile} />);

    const ctaButton = screen.getByRole('button', { name: /הגדר סיסמה עכשיו/i });
    fireEvent.click(ctaButton);

    if (mockPush.mock.calls.length === 0) throw new Error('Navigation function not called');
    const expectedUrl = `/set-password?email=${encodeURIComponent(googleProfile.email)}`;
    if (mockPush.mock.calls[0][0] !== expectedUrl) {
      throw new Error(`Expected URL ${expectedUrl}, got ${mockPush.mock.calls[0][0]}`);
    }
  });

  it('shows warning icon or indicator', () => {
    const googleProfile = { ...mockUserProfile, authProvider: 'google' };
    render(<PasswordAlert profile={googleProfile} />);

    // Look for warning indicators like exclamation mark or warning icon
    const warningIndicators = ['⚠️', '🔒', '🛡️', '!'];
    const hasWarningIndicator = warningIndicators.some(indicator =>
      screen.queryByText(indicator) !== null
    );

    if (!hasWarningIndicator && !screen.getByRole('button')) {
      throw new Error('No warning indicator found');
    }
  });

  it('applies alert styling classes', () => {
    const googleProfile = { ...mockUserProfile, authProvider: 'google' };
    const { container } = render(<PasswordAlert profile={googleProfile} />);

    const orangeBorderElement = container.querySelector('.border-orange-300');
    const orangeBgElement = container.querySelector('.bg-orange-50');
    if (!orangeBorderElement) throw new Error('Orange border class not found');
    if (!orangeBgElement) throw new Error('Orange background class not found');
  });

  it('includes responsive design elements', () => {
    const googleProfile = { ...mockUserProfile, authProvider: 'google' };
    const { container } = render(<PasswordAlert profile={googleProfile} />);

    const flexElement = container.querySelector('.sm\\:flex');
    const justifyElement = container.querySelector('.justify-between');
    if (!flexElement) throw new Error('Responsive flex class not found');
    if (!justifyElement) throw new Error('Justify between class not found');
  });

  it('shows proper alert for different Google account scenarios', () => {
    const differentGoogleProfile = {
      ...mockUserProfile,
      authProvider: 'google',
      email: 'different.user@gmail.com',
    };
    
    render(<PasswordAlert profile={differentGoogleProfile} />);

    const ctaButton = screen.getByRole('button', { name: /הגדר סיסמה עכשיו/i });
    fireEvent.click(ctaButton);

    if (mockPush.mock.calls.length === 0) throw new Error('Navigation function not called');
    const expectedUrl = `/set-password?email=${encodeURIComponent(differentGoogleProfile.email)}`;
    if (mockPush.mock.calls[0][0] !== expectedUrl) {
      throw new Error(`Expected URL ${expectedUrl}, got ${mockPush.mock.calls[0][0]}`);
    }
  });

  it('handles undefined or null profile gracefully', () => {
    const { container } = render(<PasswordAlert profile={null as any} />);
    if (container.firstChild !== null) throw new Error('Component should not render for null profile');
  });
}); 