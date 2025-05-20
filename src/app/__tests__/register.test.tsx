import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Register from '../register/page';

interface RegisterRequestBody {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  idNumber: string;
}

// Mock the API endpoints
const server = setupServer(
  http.post('/api/register', async ({ request }) => {
    const { email, password, fullName, phone, idNumber } = await request.json() as RegisterRequestBody;
    
    // Simulate validation
    if (!email || !password || !fullName || !phone || !idNumber) {
      return HttpResponse.json(
        { error: 'כל השדות נדרשים' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return HttpResponse.json(
        { error: 'כתובת אימייל לא תקינה' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return HttpResponse.json(
        { error: 'הסיסמה חייבת להכיל לפחות 8 תווים' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^(0[0-9]{9}|[+]972[0-9]{9})$/;
    if (!phoneRegex.test(phone)) {
      return HttpResponse.json(
        { error: 'מספר טלפון לא תקין. יש להזין מספר המתחיל ב-0 או +972' },
        { status: 400 }
      );
    }

    // Validate ID number format
    const idRegex = /^[0-9]{9}$/;
    if (!idRegex.test(idNumber)) {
      return HttpResponse.json(
        { error: 'מספר תעודת זהות חייב להכיל 9 ספרות' },
        { status: 400 }
      );
    }
    
    // Simulate successful registration
    return HttpResponse.json({
      user: {
        _id: '123',
        email,
        fullName,
        phone,
        idNumber
      },
      token: 'mock-jwt-token'
    });
  })
);

describe('Register Page', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('shows validation errors when submitting empty form', async () => {
    render(<Register />);
    
    const submitButton = screen.getByText('הרשמה');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('כל השדות נדרשים')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<Register />);
    
    fireEvent.change(screen.getByLabelText(/אימייל/i), {
      target: { value: 'invalid-email' },
    });
    
    const submitButton = screen.getByText('הרשמה');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('כתובת אימייל לא תקינה')).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    render(<Register />);
    
    fireEvent.change(screen.getByLabelText(/סיסמה/i), {
      target: { value: '123' },
    });
    
    const submitButton = screen.getByText('הרשמה');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('הסיסמה חייבת להכיל לפחות 8 תווים')).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    render(<Register />);
    
    // Test invalid phone numbers
    const invalidPhones = ['123', '123456789', '972123456789', '1234567890'];
    
    for (const phone of invalidPhones) {
      fireEvent.change(screen.getByLabelText(/טלפון/i), {
        target: { value: phone },
      });
      
      const submitButton = screen.getByText('הרשמה');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('מספר טלפון לא תקין. יש להזין מספר המתחיל ב-0 או +972')).toBeInTheDocument();
      });
    }
  });

  it('validates ID number format', async () => {
    render(<Register />);
    
    // Test invalid ID numbers
    const invalidIds = ['123', '12345678', '1234567890', '12345678a'];
    
    for (const id of invalidIds) {
      fireEvent.change(screen.getByLabelText(/תעודת זהות/i), {
        target: { value: id },
      });
      
      const submitButton = screen.getByText('הרשמה');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('מספר תעודת זהות חייב להכיל 9 ספרות')).toBeInTheDocument();
      });
    }
  });

  it('successfully registers a new user with valid data', async () => {
    render(<Register />);
    
    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/שם מלא/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/אימייל/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/סיסמה/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/טלפון/i), {
      target: { value: '0501234567' },
    });
    fireEvent.change(screen.getByLabelText(/תעודת זהות/i), {
      target: { value: '123456789' },
    });
    
    const submitButton = screen.getByText('הרשמה');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('ההרשמה הושלמה בהצלחה!')).toBeInTheDocument();
    });
  });

  it('handles server errors gracefully', async () => {
    server.use(
      http.post('/api/register', async () => {
        return HttpResponse.json(
          { error: 'שגיאת שרת' },
          { status: 500 }
        );
      })
    );
    
    render(<Register />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/שם מלא/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/אימייל/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/סיסמה/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/טלפון/i), {
      target: { value: '0501234567' },
    });
    fireEvent.change(screen.getByLabelText(/תעודת זהות/i), {
      target: { value: '123456789' },
    });
    
    const submitButton = screen.getByText('הרשמה');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('שגיאת שרת')).toBeInTheDocument();
    });
  });
});  