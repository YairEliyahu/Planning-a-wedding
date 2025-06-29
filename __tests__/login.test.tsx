/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react'; 
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/app/login/page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock LoadingSpinner
jest.mock('@/components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ text }: { text: string }) {
    return <div data-testid="loading-spinner">{text}</div>;
  };
});

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock;

const mockPush = jest.fn();
const mockSearchParams = {
  get: jest.fn(),
};

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });
  (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  (useAuth as jest.Mock).mockReturnValue({
    login: jest.fn(),
  });
  
  // Clear all mocks
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
    render(<LoginPage />);
    
    expect(screen.getByText('התחברות')).toBeInTheDocument();
    expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/סיסמה/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'התחבר' })).toBeInTheDocument();
    expect(screen.getByText('התחבר עם Google')).toBeInTheDocument();
    expect(screen.getByText('הירשם כאן')).toBeInTheDocument();
  });

  it('displays error messages from URL parameters', () => {
    mockSearchParams.get.mockImplementation((param) => {
      if (param === 'error') return 'MissingGoogleConfig';
      return null;
    });
    
    render(<LoginPage />);
    
    expect(screen.getByText('חסרות הגדרות לחיבור עם גוגל')).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/אימייל/i);
    const passwordInput = screen.getByLabelText(/סיסמה/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('initiates Google login when Google button is clicked', () => {
    render(<LoginPage />);
    
    const googleButton = screen.getByText('התחבר עם Google');
    fireEvent.click(googleButton);
    
    expect(window.localStorage.setItem).toHaveBeenCalledWith('google_auth_started', expect.any(String));
    expect(window.location.href).toBe('/api/auth/google');
    expect(screen.getByText('מתחבר עם Google...')).toBeInTheDocument();
  });

  it('shows loading state when Google login is initiated', () => {
    render(<LoginPage />);
    
    const googleButton = screen.getByText('התחבר עם Google');
    fireEvent.click(googleButton);
    
    expect(screen.getByText('מתחבר עם Google...')).toBeInTheDocument();
    expect(screen.getByText('מתחבר לשירותי גוגל...')).toBeInTheDocument();
  });

  it('disables buttons during Google loading state', () => {
    render(<LoginPage />);
    
    const googleButton = screen.getByText('התחבר עם Google');
    fireEvent.click(googleButton);
    
    expect(screen.getByRole('button', { name: 'התחבר' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'מתחבר עם Google...' })).toBeDisabled();
  });

  it('has correct form structure and attributes', () => {
    render(<LoginPage />);
    
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
    render(<LoginPage />);
    
    const registerLink = screen.getByRole('link', { name: 'הירשם כאן' });
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
      
      const { unmount } = render(<LoginPage />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('form submission calls fetch with correct data', () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { _id: '123' }, token: 'token' }),
    });

    render(<LoginPage />);
    
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

  it('handles form submission with loading state', () => {
    (fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ user: { _id: '123' }, token: 'token' }),
      }), 100))
    );

    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/אימייל/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/סיסמה/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));
    
    expect(screen.getByText('מתחבר...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'מתחבר...' })).toBeDisabled();
  });

  it('handles login error responses', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/אימייל/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/סיסמה/i), {
      target: { value: 'wrongpassword' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));

    // Wait for error to appear
    await screen.findByText('Invalid credentials');
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('handles network errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/אימייל/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/סיסמה/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));

    await screen.findByText('Network error');
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('redirects to user page after successful login', async () => {
    const mockLogin = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { _id: '123' }, token: 'token' }),
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/אימייל/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/סיסמה/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'התחבר' }));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockLogin).toHaveBeenCalledWith('token', { _id: '123' });
    expect(mockPush).toHaveBeenCalledWith('/user/123');
  });

  it('checks localStorage for Google auth state on component mount', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('1234567890');
    
    render(<LoginPage />);
    
    expect(window.localStorage.getItem).toHaveBeenCalledWith('google_auth_started');
  });

  it('clears old Google auth sessions', () => {
    // Mock old timestamp (more than 30 seconds ago)
    const oldTimestamp = Date.now() - 35000;
    (window.localStorage.getItem as jest.Mock).mockReturnValue(oldTimestamp.toString());
    
    render(<LoginPage />);
    
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('google_auth_started');
  });
}); 