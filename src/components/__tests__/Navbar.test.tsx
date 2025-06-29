import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '../Navbar';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('Navbar', () => {
  const mockUser = {
    _id: '123',
    fullName: 'Test User',
    email: 'test@example.com',
    isProfileComplete: true,
  };

  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock usePathname
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('renders login button when user is not authenticated', () => {
    // Mock the useAuth hook to return no user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isAuthReady: true,
    });

    render(<Navbar />);
    
    expect(screen.getByText('התחבר')).toBeInTheDocument();
    expect(screen.queryByText('התנתק')).not.toBeInTheDocument();
  });

  it('renders user name and logout button when user is authenticated', () => {
    // Mock the useAuth hook to return a user
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      isAuthReady: true,
    });

    render(<Navbar />);
    
    expect(screen.getByText(`שלום, ${mockUser.fullName}`)).toBeInTheDocument();
    expect(screen.getByText('התנתק')).toBeInTheDocument();
    expect(screen.queryByText('התחבר')).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    const mockLogout = jest.fn();
    
    // Mock the useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: mockLogout,
      isAuthReady: true,
    });

    render(<Navbar />);
    
    const logoutButton = screen.getByText('התנתק');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when auth is not ready', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isAuthReady: false,
    });

    render(<Navbar />);
    
    // Should show loading indicators (three dots)
    const loadingDots = screen.getByRole('navigation').querySelectorAll('.animate-pulse');
    expect(loadingDots.length).toBeGreaterThan(0);
  });
}); 