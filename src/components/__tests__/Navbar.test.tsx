import { render, screen, fireEvent } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '../Navbar';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext');

describe('Navbar', () => {
  const mockUser = {
    _id: '123',
    fullName: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders login button when user is not authenticated', () => {
    // Mock the useAuth hook to return no user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<Navbar />);
    
    expect(screen.getByText('התחברות')).toBeInTheDocument();
    expect(screen.queryByText('התנתקות')).not.toBeInTheDocument();
  });

  it('renders user name and logout button when user is authenticated', () => {
    // Mock the useAuth hook to return a user
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<Navbar />);
    
    expect(screen.getByText(mockUser.fullName)).toBeInTheDocument();
    expect(screen.getByText('התנתקות')).toBeInTheDocument();
    expect(screen.queryByText('התחברות')).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    const mockLogout = jest.fn()
    
    // Mock the useAuth hook
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: mockLogout,
    });

    render(<Navbar />);
    
    const logoutButton = screen.getByText('התנתקות');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
}); 