/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Login from '../login/page';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock LoadingSpinner
jest.mock('../components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ text }: { text: string }) {
    return <div data-testid="loading-spinner">{text}</div>;
  };
});

// Mock fetch globally
global.fetch = jest.fn();

const mockPush = jest.fn();
const mockSearchParams = {
  get: jest.fn(),
};

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });
  (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  
  // Clear all mocks
  mockLogin.mockClear();
  mockPush.mockClear();
  mockSearchParams.get.mockClear();
  (fetch as jest.Mock).mockClear();
  
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });
  
  // Mock window.confirm
  window.confirm = jest.fn();
  
  // Mock window.location
  delete (window as any).location;
  window.location = { href: '' } as any;
});

describe('Login Page', () => {
  it('renders login form correctly', () => {
    render(<Login />);
    
    expect(screen.getByText('התחברות')).toBeInTheDocument();
    expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/סיסמה/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'התחבר' })).toBeInTheDocument();
    expect(screen.getByText('התחבר עם Google')).toBeInTheDocument();
    expect(screen.getByText('הירשם עכשיו')).toBeInTheDocument();
  });

  it('displays error messages from URL parameters', () => {
    mockSearchParams.get.mockImplementation((param) => {
      if (param === 'error') return 'MissingGoogleConfig';
      return null;
    });
    
    render(<Login />);
    
    expect(screen.getByText('חסרות הגדרות לחיבור עם גוגל')).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/אימייל/i);
    const passwordInput = screen.getByLabelText(/סיסמה/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('initiates Google login when Google button is clicked', () => {
    render(<Login />);
    
    const googleButton = screen.getByText('התחבר עם Google');
    fireEvent.click(googleButton);
    
    expect(window.localStorage.setItem).toHaveBeenCalledWith('google_auth_started', expect.any(String));
    expect(window.location.href).toBe('/api/auth/google');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows loading spinner when Google login is initiated', () => {
    render(<Login />);
    
    const googleButton = screen.getByText('התחבר עם Google');
    fireEvent.click(googleButton);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('מתחבר לשירותי גוגל...')).toBeInTheDocument();
  });

  it('disables buttons during Google loading state', () => {
    render(<Login />);
    
    const googleButton = screen.getByText('התחבר עם Google');
    fireEvent.click(googleButton);
    
    expect(screen.getByRole('button', { name: 'התחבר' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'מתחבר לגוגל...' })).toBeDisabled();
  });

  it('has correct form structure and attributes', () => {
    render(<Login />);
    
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText(/אימייל/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('dir', 'rtl');
    
    const passwordInput = screen.getByLabelText(/סיסמה/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('dir', 'rtl');
  });

  it('has correct link to registration page', () => {
    render(<Login />);
    
    const registerLink = screen.getByRole('link', { name: 'הירשם עכשיו' });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('displays different error messages based on URL parameters', () => {
    const errorCases = [
      { param: 'NoCode', expected: 'לא התקבל קוד אימות מגוגל' },
      { param: 'NoEmail', expected: 'לא התקבל מייל מחשבון הגוגל' },
      { param: 'CallbackFailed', expected: 'שגיאה בתהליך התחברות עם גוגל' },
      { param: 'GoogleAuthInitFailed', expected: 'לא ניתן להתחיל תהליך התחברות עם גוגל' },
    ];

    errorCases.forEach(({ param, expected }) => {
      mockSearchParams.get.mockImplementation((p) => {
        if (p === 'error') return param;
        return null;
      });
      
      const { unmount } = render(<Login />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('form submission calls fetch with correct data', () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { _id: '123' }, token: 'token' }),
    });

    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/אימייל/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/סיסמה/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));
    
    expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
  });
}); 