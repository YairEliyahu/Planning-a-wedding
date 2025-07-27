import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import RegisterPage from '@/app/register/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock LoadingSpinner
jest.mock('@/app/components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ text }: { text: string }) {
    return <div data-testid="loading-spinner">{text}</div>;
  };
});

// Mock OSMPlacesAutocomplete
jest.mock('@/app/components/OSMPlacesAutocomplete', () => {
  return function MockOSMPlacesAutocomplete({ 
    value, 
    onChange, 
    placeholder 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    placeholder: string;
  }) {
    return (
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="location-autocomplete"
      />
    );
  };
});

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock;

const mockPush = jest.fn();

describe('Register Page', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Clear all mocks
    mockPush.mockClear();
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    render(<RegisterPage />);
    
    expect(screen.getByRole('heading', { name: 'הרשמה' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('הכנס את השם המלא שלך')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('הכנס את כתובת המייל שלך')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('מספר טלפון (9 ספרות)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('מספר תעודת זהות (9 ספרות)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'הרשמה' })).toBeInTheDocument();
  });

  it('allows user to type in input fields', () => {
    render(<RegisterPage />);
    
    const nameInput = screen.getByPlaceholderText('הכנס את השם המלא שלך');
    const emailInput = screen.getByPlaceholderText('הכנס את כתובת המייל שלך');
    const passwordInput = screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)');
    const idInput = screen.getByPlaceholderText('מספר תעודת זהות (9 ספרות)');
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(idInput, { target: { value: '123456789' } });
    
    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(idInput).toHaveValue('123456789');
  });

  it('renders basic form structure', () => {
    render(<RegisterPage />);
    
    // בדיקה שהקומפוננט נטען בלי שגיאות
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('הכנס את השם המלא שלך')).toBeInTheDocument();
  });

  it('has correct form attributes', () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByPlaceholderText('הכנס את כתובת המייל שלך');
    const passwordInput = screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)');
    const phoneInput = screen.getByPlaceholderText('מספר טלפון (9 ספרות)');
    const idInput = screen.getByPlaceholderText('מספר תעודת זהות (9 ספרות)');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
    expect(phoneInput).toHaveAttribute('type', 'tel');
    expect(idInput).toHaveAttribute('maxlength', '9');
  });

  it('form submission triggers fetch call', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        user: { _id: '123', email: 'test@example.com' },
        token: 'token'
      }),
    });

    render(<RegisterPage />);
    
    // מלא שדות חובה
    fireEvent.change(screen.getByPlaceholderText('הכנס את השם המלא שלך'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('הכנס את כתובת המייל שלך'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)'), {
      target: { value: 'password123' },
    });
    
    const submitButton = screen.getByRole('button', { name: 'הרשמה' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('shows error message on failed registration', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Registration failed' }),
    });

    render(<RegisterPage />);
    
    // מלא שדות חובה
    fireEvent.change(screen.getByPlaceholderText('הכנס את השם המלא שלך'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('הכנס את כתובת המייל שלך'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)'), {
      target: { value: 'password123' },
    });
    
    const submitButton = screen.getByRole('button', { name: 'הרשמה' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        user: { _id: '123', email: 'test@example.com' },
        token: 'token'
      }),
    });

    render(<RegisterPage />);
    
    // מלא את הטופס עם נתונים תקינים
    fireEvent.change(screen.getByPlaceholderText('הכנס את השם המלא שלך'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('הכנס את כתובת המייל שלך'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)'), {
      target: { value: 'password123' },
    });
    
    const submitButton = screen.getByRole('button', { name: 'הרשמה' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  it('displays gender select options', () => {
    render(<RegisterPage />);
    
    const genderSelect = screen.getByLabelText('מגדר');
    expect(genderSelect).toBeInTheDocument();
    
    // בדיקת האפשרויות
    expect(screen.getByText('זכר')).toBeInTheDocument();
    expect(screen.getByText('נקבה')).toBeInTheDocument();
    expect(screen.getByText('אחר')).toBeInTheDocument();
  });

  it('has phone prefix selector', () => {
    render(<RegisterPage />);
    
    // בדוק שיש אפשרויות קידומת לטלפון
    expect(screen.getByText('+972')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders location input field', () => {
    render(<RegisterPage />);
    
    const locationInput = screen.getByTestId('location-autocomplete');
    expect(locationInput).toBeInTheDocument();
  });

  it('validates phone number length', () => {
    render(<RegisterPage />);
    
    const phoneInput = screen.getByPlaceholderText('מספר טלפון (9 ספרות)');
    
    // טלפון קצר מדי
    fireEvent.change(phoneInput, { target: { value: '12345' } });
    expect(phoneInput).toHaveValue('12345');
    
    // טלפון באורך מתאים
    fireEvent.change(phoneInput, { target: { value: '123456789' } });
    expect(phoneInput).toHaveValue('123456789');
    
    // לא יכול להיות יותר מ-9 ספרות
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(phoneInput).toHaveValue('123456789'); // צריך להישאר 9
  });

  it('validates ID number length', () => {
    render(<RegisterPage />);
    
    const idInput = screen.getByPlaceholderText('מספר תעודת זהות (9 ספרות)');
    
    fireEvent.change(idInput, { target: { value: '123456789' } });
    expect(idInput).toHaveValue('123456789');
    
    // בדיקה שיש maxlength
    expect(idInput).toHaveAttribute('maxlength', '9');
  });

  it('validates age input', () => {
    render(<RegisterPage />);
    
    const ageInput = screen.getByPlaceholderText('גיל (אופציונלי)');
    
    // גיל תקין
    fireEvent.change(ageInput, { target: { value: '25' } });
    expect(ageInput).toHaveValue(25);
    
    // בדיקת min/max attributes
    expect(ageInput).toHaveAttribute('min', '0');
    expect(ageInput).toHaveAttribute('max', '120');
  });

  it('shows loading state during registration', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ user: { _id: '123' }, token: 'token' })
      }), 100))
    );

    render(<RegisterPage />);
    
    // מלא שדות חובה
    fireEvent.change(screen.getByPlaceholderText('הכנס את השם המלא שלך'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('הכנס את כתובת המייל שלך'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)'), {
      target: { value: 'password123' },
    });
    
    const submitButton = screen.getByRole('button', { name: 'הרשמה' });
    fireEvent.click(submitButton);
    
    // בדיקה שהכפתור מראה מצב loading
    expect(screen.getAllByText('מבצע רישום...')[0]).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles network error during registration', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<RegisterPage />);
    
    // מלא שדות חובה
    fireEvent.change(screen.getByPlaceholderText('הכנס את השם המלא שלך'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('הכנס את כתובת המייל שלך'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)'), {
      target: { value: 'password123' },
    });
    
    const submitButton = screen.getByRole('button', { name: 'הרשמה' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('validates email format', () => {
    render(<RegisterPage />);
    
    const emailInput = screen.getByPlaceholderText('הכנס את כתובת המייל שלך');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it('validates password requirements', () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('minlength', '8');
  });

  it('shows invitation message when invitation token exists', () => {
    // Mock localStorage to return an invitation token
    const mockGetItem = jest.fn().mockReturnValue('test-invitation-token');
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: mockGetItem, setItem: jest.fn(), removeItem: jest.fn() },
      writable: true,
    });

    render(<RegisterPage />);
    
    expect(screen.getByText('התקבלה הזמנה לשיתוף ניהול חשבון חתונה!')).toBeInTheDocument();
    expect(screen.getByText('אנא השלם את ההרשמה כדי להצטרף לחשבון המשותף.')).toBeInTheDocument();
  });

  it('has correct link to login page', () => {
    render(<RegisterPage />);
    
    const loginLink = screen.getByRole('link', { name: 'התחבר כאן' });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('form fields have correct accessibility labels', () => {
    render(<RegisterPage />);
    
    expect(screen.getByLabelText('שם מלא *')).toBeInTheDocument();
    expect(screen.getByLabelText('גיל')).toBeInTheDocument();
    expect(screen.getByLabelText('מגדר')).toBeInTheDocument();
    expect(screen.getByLabelText('מספר טלפון')).toBeInTheDocument();
    expect(screen.getByLabelText('מספר תעודת זהות')).toBeInTheDocument();
    expect(screen.getByLabelText('אימייל *')).toBeInTheDocument();
    expect(screen.getByLabelText('סיסמה *')).toBeInTheDocument();
    
    // בדיקה של location בצורה אחרת כי אין לו label מקושר
    expect(screen.getByTestId('location-autocomplete')).toBeInTheDocument();
  });

  it('validates required fields with proper attributes', () => {
    render(<RegisterPage />);
    
    // בדיקה שיש שדות חובה עם required attribute
    const nameInput = screen.getByPlaceholderText('הכנס את השם המלא שלך');
    const emailInput = screen.getByPlaceholderText('הכנס את כתובת המייל שלך');
    const passwordInput = screen.getByPlaceholderText('סיסמה (לפחות 8 תווים)');
    
    expect(nameInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });
});  