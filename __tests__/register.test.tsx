// @ts-ignore
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../register/page';

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock;

describe('Register Page', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    render(<Register />);
    
    expect(screen.getByRole('heading', { name: 'הרשמה' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/שם מלא/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/אימייל/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/סיסמה/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/מספר טלפון/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/תעודת זהות/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'הרשמה' })).toBeInTheDocument();
  });

  it('allows user to type in input fields', () => {
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText(/שם מלא/i);
    const emailInput = screen.getByPlaceholderText(/אימייל/i);
    const passwordInput = screen.getByPlaceholderText(/סיסמה/i);
    const idInput = screen.getByPlaceholderText(/תעודת זהות/i);
    
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
    render(<Register />);
    
    // בדיקה שהקומפוננט נטען בלי שגיאות
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/שם מלא/i)).toBeInTheDocument();
  });

  it('has correct form attributes', () => {
    render(<Register />);
    
    const emailInput = screen.getByPlaceholderText(/אימייל/i);
    const passwordInput = screen.getByPlaceholderText(/סיסמה/i);
    const phoneInput = screen.getByPlaceholderText(/מספר טלפון/i);
    const idInput = screen.getByPlaceholderText(/תעודת זהות/i);
    
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

    render(<Register />);
    
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
      json: () => Promise.resolve({ error: 'Registration failed' }),
    });

    render(<Register />);
    
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

    render(<Register />);
    
    // מלא את הטופס עם נתונים תקינים
    fireEvent.change(screen.getByPlaceholderText(/שם מלא/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/אימייל/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/סיסמה/i), {
      target: { value: 'password123' },
    });
    
    const submitButton = screen.getByRole('button', { name: 'הרשמה' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/register', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  it('displays gender select options', () => {
    render(<Register />);
    
    const genderSelect = screen.getByDisplayValue('בחר מגדר');
    expect(genderSelect).toBeInTheDocument();
    
    // בדיקת האפשרויות
    expect(screen.getByText('זכר')).toBeInTheDocument();
    expect(screen.getByText('נקבה')).toBeInTheDocument();
    expect(screen.getByText('אחר')).toBeInTheDocument();
  });

  it('has phone prefix selector', () => {
    render(<Register />);
    
    // בדוק שיש אפשרויות קידומת לטלפון
    expect(screen.getByDisplayValue('+972')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });

  it('renders location input field', () => {
    render(<Register />);
    
    const locationInput = screen.getByPlaceholderText(/מיקום מגורים/i);
    expect(locationInput).toBeInTheDocument();
  });
});  