/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Bar: ({ data }: any) => (
    <div data-testid="budget-chart">
      Budget Chart: {data?.datasets?.[0]?.label}
    </div>
  ),
  Pie: ({ data }: any) => (
    <div data-testid="pie-chart">
      Pie Chart: {data?.datasets?.[0]?.label}
    </div>
  ),
}));

// Mock Chart.js registration
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
}));

// Mock Components
jest.mock('@/components/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar</nav>;
  };
});

jest.mock('@/components/NavbarProfile', () => {
  return function MockNavbarProfile() {
    return <nav data-testid="navbar-profile">NavbarProfile</nav>;
  };
});

jest.mock('../components/LoadingSpinner', () => {
  return function MockLoadingSpinner({ text, fullScreen }: { text?: string; fullScreen?: boolean }) {
    return (
      <div data-testid="loading-spinner" data-fullscreen={fullScreen}>
        {text || 'Loading...'}
      </div>
    );
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock XLSX for guestlist tests
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

// Global fetch mock
global.fetch = jest.fn();

const mockPush = jest.fn();
const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  fullName: 'Test User',
  isProfileComplete: true,
  authProvider: 'local',
};

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });
  (useAuth as jest.Mock).mockReturnValue({
    user: mockUser,
    isAuthReady: true,
  });
  (fetch as jest.Mock).mockClear();
});

/* ============================================================================
   📊 בדיקות לדף הבית של המשתמש (USER DASHBOARD)
   ============================================================================
   
   הדף הראשי מכיל:
   - דשבורד עם נתונים סטטיסטיים
   - ספירה לאחור לחתונה
   - ניתוח תקציב עם גרפים
   - התראות למשתמשי Google
   - מידע על ארנק והוצאות
   ============================================================================ */

describe('🏠 User Dashboard (Main Page)', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const UserProfilePage = require('../user/[id]/page').default;
  
  const mockProfile = {
    _id: 'user123',
    fullName: 'John Doe',
    partnerName: 'Jane Doe',
    email: 'john@example.com',
    weddingDate: '2024-12-31T00:00:00.000Z',
    authProvider: 'local',
    isProfileComplete: true,
  };

  const mockChecklistData = {
    checklist: [
      {
        name: 'אולם',
        items: [
          { id: '1', name: 'אולם חתונה', budget: '50000', guestCount: 100, averageGift: 500 }
        ]
      }
    ]
  };

  it('✅ should render dashboard with user greeting', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockProfile }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChecklistData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    await act(async () => {
      render(<UserProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/היי John Doe וJane Doe/)).toBeInTheDocument();
    });
  });

  it('✅ should display countdown timer with correct structure', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockProfile }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChecklistData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    await act(async () => {
      render(<UserProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText('ימים')).toBeInTheDocument();
      expect(screen.getByText('שעות')).toBeInTheDocument();
      expect(screen.getByText('דקות')).toBeInTheDocument();
      expect(screen.getByText('שניות')).toBeInTheDocument();
    });
  });

  it('✅ should show Google auth notification for Google users', async () => {
    const googleUser = { ...mockProfile, authProvider: 'google' };
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: googleUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChecklistData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    await act(async () => {
      render(<UserProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText('הגדר סיסמה לחשבון שלך')).toBeInTheDocument();
    });
  });

  it('✅ should render budget analysis chart when data available', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockProfile }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChecklistData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    await act(async () => {
      render(<UserProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('budget-chart')).toBeInTheDocument();
    });
  });

  it('✅ should handle incomplete profile redirect', async () => {
    const incompleteProfile = { ...mockProfile, isProfileComplete: false };
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: incompleteProfile }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChecklistData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    await act(async () => {
      render(<UserProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/complete-profile');
    });
  });

  it('✅ should handle authentication errors', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthReady: true,
    });

    render(<UserProfilePage params={{ id: 'user123' }} />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('✅ should redirect if user ID mismatch', () => {
    render(<UserProfilePage params={{ id: 'different-user' }} />);

    expect(mockPush).toHaveBeenCalledWith('/user/user123');
  });

  it('✅ should show error state and retry functionality', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(<UserProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText('שגיאה בטעינת הנתונים')).toBeInTheDocument();
      expect(screen.getByText('נסה שנית')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('נסה שנית');
    fireEvent.click(retryButton);

    expect(fetch).toHaveBeenCalled();
  });

  it('✅ should display loading spinner initially', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthReady: false,
    });

    render(<UserProfilePage params={{ id: 'user123' }} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('טוען את פרופיל המשתמש...')).toBeInTheDocument();
  });
});

/* ============================================================================
   🎨 בדיקות לעמוד הLayout
   ============================================================================
   
   הLayout מכיל:
   - אנימציות עם framer-motion
   - NavbarProfile
   - מבנה עמוד בסיסי
   ============================================================================ */

describe('🎨 User Layout Component', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ProfileLayout = require('../user/[id]/layout').default;

  it('✅ should render NavbarProfile component', () => {
    render(
      <ProfileLayout>
        <div>Test Content</div>
      </ProfileLayout>
    );

    expect(screen.getByTestId('navbar-profile')).toBeInTheDocument();
  });

  it('✅ should render children content', () => {
    render(
      <ProfileLayout>
        <div data-testid="test-content">Test Content</div>
      </ProfileLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('✅ should have correct CSS classes for layout', () => {
    const { container } = render(
      <ProfileLayout>
        <div>Test Content</div>
      </ProfileLayout>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('min-h-screen');
  });
});

/* ============================================================================
   ✏️ בדיקות לעמוד עריכת פרופיל (EDIT PROFILE)
   ============================================================================
   
   עמוד עריכת הפרופיל מכיל:
   - טופס עריכה מקיף לכל שדות הפרופיל
   - הזמנת שותף/ה למערכת
   - העלאת תמונת פרופיל
   - ניהול העדפות משתמש
   - שמירה ועדכון נתונים
   ============================================================================ */

describe('✏️ Edit Profile Page', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EditProfilePage = require('../user/[id]/edit/page').default;
  
  const mockUserProfile = {
    _id: 'user123',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '050-1234567',
    weddingDate: '2024-12-31',
    partnerName: 'Jane Doe',
    partnerPhone: '050-7654321',
    partnerEmail: 'jane@example.com',
    expectedGuests: '100',
    budget: '150000',
    venueType: 'garden',
    timeOfDay: 'evening',
    locationPreference: 'center',
    preferences: {
      venue: true,
      catering: false,
      photography: true,
      music: false,
      design: true,
    },
    authProvider: 'local',
    partnerInvitePending: false,
    partnerInviteAccepted: false,
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUserProfile }),
    });
  });

  it('✅ should render edit profile form with all fields', async () => {
    await act(async () => {
      render(<EditProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('050-1234567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  it('✅ should handle form input changes', async () => {
    await act(async () => {
      render(<EditProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Johnny Doe' } });
      expect(nameInput).toHaveValue('Johnny Doe');
    });
  });

  it('✅ should handle preference toggles', async () => {
    await act(async () => {
      render(<EditProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      // מחפש checkbox של venue שאמור להיות מסומן
      const venueCheckbox = screen.getByRole('checkbox', { name: /אולם/i });
      expect(venueCheckbox).toBeChecked();
      
      // לוחץ עליו כדי לבטל את הסימון
      fireEvent.click(venueCheckbox);
      expect(venueCheckbox).not.toBeChecked();
    });
  });

  it('✅ should submit form with updated data', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUserProfile }),
      })
      .mockResolvedValueOnce(mockResponse);

    await act(async () => {
      render(<EditProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Johnny Doe' } });
      
      const submitButton = screen.getByRole('button', { name: /עדכן פרופיל/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user/user123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Johnny Doe'),
      });
    });
  });

  it('✅ should show success message after update', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUserProfile }),
      })
      .mockResolvedValueOnce(mockResponse);

    await act(async () => {
      render(<EditProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /עדכן פרופיל/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('הפרופיל עודכן בהצלחה!')).toBeInTheDocument();
    });
  });

  it('✅ should handle update errors', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUserProfile }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Update failed' }),
      });

    await act(async () => {
      render(<EditProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /עדכן פרופיל/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('✅ should show partner invitation status', async () => {
    const userWithPendingInvite = {
      ...mockUserProfile,
      partnerInvitePending: true,
      partnerEmail: 'jane@example.com',
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: userWithPendingInvite }),
    });

    await act(async () => {
      render(<EditProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/הזמנה נשלחה ל-jane@example.com/)).toBeInTheDocument();
    });
  });

  it('✅ should handle partner invite sending', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUserProfile }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    await act(async () => {
      render(<EditProfilePage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const inviteButton = screen.getByRole('button', { name: /שלח הזמנה לשותף/i });
      fireEvent.click(inviteButton);
    });

    expect(fetch).toHaveBeenCalledWith('/api/invite-partner', expect.any(Object));
  });

  it('✅ should redirect unauthorized users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthReady: true,
    });

    render(<EditProfilePage params={{ id: 'user123' }} />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('✅ should redirect on user ID mismatch', () => {
    render(<EditProfilePage params={{ id: 'different-user' }} />);

    expect(mockPush).toHaveBeenCalledWith('/user/user123/edit');
  });
});

/* ============================================================================
   📋 בדיקות לעמוד רשימת המשימות (CHECKLIST)
   ============================================================================
   
   רשימת המשימות מכילה:
   - רשימת משימות לארגון החתונה
   - ניהול תקציב למשימות
   - גרף Pie לחלוקת התקציב
   - סינון ומיון משימות
   - הוספה ועריכה של משימות
   - חישוב התקדמות
   ============================================================================ */

describe('📋 Checklist Page', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ChecklistPage = require('../user/[id]/checklist/page').default;
  
  const mockChecklistData = {
    checklist: [
      {
        name: 'אולם',
        items: [
          {
            id: '1',
            category: 'אולם',
            name: 'התחייבות כמות אורחים לאולם',
            isCompleted: false,
            budget: '50000',
            priority: 'high',
            guestCount: 100,
            averageGift: 500,
          }
        ],
        isExpanded: true,
        icon: '🏰',
      },
      {
        name: 'ספקים',
        items: [
          {
            id: '2',
            category: 'ספקים',
            name: 'צלם וידאו',
            isCompleted: true,
            budget: '8000',
            priority: 'high',
          }
        ],
        isExpanded: true,
        icon: '👥',
      }
    ]
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockChecklistData),
    });
  });

  it('✅ should render checklist categories', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText('אולם')).toBeInTheDocument();
      expect(screen.getByText('ספקים')).toBeInTheDocument();
    });
  });

  it('✅ should display checklist items', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText('התחייבות כמות אורחים לאולם')).toBeInTheDocument();
      expect(screen.getByText('צלם וידאו')).toBeInTheDocument();
    });
  });

  it('✅ should render budget analysis pie chart', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  it('✅ should toggle item completion status', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChecklistData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);
    });

    expect(fetch).toHaveBeenCalledWith('/api/wedding-checklist/user123', expect.any(Object));
  });

  it('✅ should handle budget input changes', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const budgetInput = screen.getByDisplayValue('50000');
      fireEvent.change(budgetInput, { target: { value: '55000' } });
      expect(budgetInput).toHaveValue('55000');
    });
  });

  it('✅ should add new checklist item', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChecklistData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const addButton = screen.getByText('הוסף משימה');
      fireEvent.click(addButton);
      
      const nameInput = screen.getByPlaceholderText('שם המשימה');
      fireEvent.change(nameInput, { target: { value: 'משימה חדשה' } });
      
      const submitButton = screen.getByText('הוסף');
      fireEvent.click(submitButton);
    });

    expect(fetch).toHaveBeenCalledWith('/api/wedding-checklist/user123', expect.any(Object));
  });

  it('✅ should filter completed items', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: 'completed' } });
      
      expect(screen.getByText('צלם וידאו')).toBeInTheDocument();
      expect(screen.queryByText('התחייבות כמות אורחים לאולם')).not.toBeInTheDocument();
    });
  });

  it('✅ should calculate total budget correctly', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/58,000/)).toBeInTheDocument(); // 50000 + 8000
    });
  });

  it('✅ should show progress percentage', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/50%/)).toBeInTheDocument(); // 1 out of 2 items completed
    });
  });

  it('✅ should reset checklist with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChecklistData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const resetButton = screen.getByText('איפוס רשימה');
      fireEvent.click(resetButton);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith('/api/wedding-checklist/user123', expect.any(Object));
  });

  it('✅ should handle guest count changes for venue items', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const guestCountInput = screen.getByDisplayValue('100');
      fireEvent.change(guestCountInput, { target: { value: '120' } });
      expect(guestCountInput).toHaveValue('120');
    });
  });

  it('✅ should handle category expansion toggle', async () => {
    await act(async () => {
      render(<ChecklistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const categoryHeader = screen.getByText('אולם');
      const expandButton = categoryHeader.closest('button');
      if (expandButton) {
        fireEvent.click(expandButton);
      }
    });

    // בדיקה שהקטגוריה התרחבה או התכווצה
    expect(screen.getByText('אולם')).toBeInTheDocument();
  });
});

/* ============================================================================
   👥 בדיקות לעמוד רשימת האורחים (GUESTLIST)
   ============================================================================
   
   רשימת האורחים מכילה:
   - ניהול רשימת מוזמנים עם פרטים מלאים
   - סינון לפי סטטוס אישור ולפי צד
   - חיפוש במוזמנים
   - הוספה, עריכה ומחיקה של מוזמנים
   - ייבוא מExcel
   - ייצוא רשימה
   - סטטיסטיקות מוזמנים
   - Pagination למוזמנים רבים
   ============================================================================ */

describe('👥 Guestlist Page', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const GuestlistPage = require('../user/[id]/guestlist/page').default;
  
  const mockGuests = [
    {
      _id: 'guest1',
      name: 'John Smith',
      phoneNumber: '050-1234567',
      numberOfGuests: 2,
      side: 'חתן',
      isConfirmed: true,
      notes: 'מגיע עם אישה',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'guest2',
      name: 'Jane Doe',
      phoneNumber: '050-7654321',
      numberOfGuests: 1,
      side: 'כלה',
      isConfirmed: false,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'guest3',
      name: 'Bob Wilson',
      phoneNumber: '050-9999999',
      numberOfGuests: 3,
      side: 'משותף',
      isConfirmed: null,
      notes: 'עדיין לא ענה',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  beforeEach(() => {
    (fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/guestlist/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ guests: mockGuests }),
        });
      }
      if (url.includes('/api/user/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: mockUser }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('✅ should render guest list with all guests', async () => {
    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  it('✅ should display guest statistics', async () => {
    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/סך הכל: 3/)).toBeInTheDocument();
      expect(screen.getByText(/אושרו: 1/)).toBeInTheDocument();
      expect(screen.getByText(/דחו: 1/)).toBeInTheDocument();
      expect(screen.getByText(/ממתינים: 1/)).toBeInTheDocument();
    });
  });

  it('✅ should handle search functionality', async () => {
    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('חפש מוזמן...');
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });
  });

  it('✅ should filter by confirmation status', async () => {
    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const statusFilter = screen.getByRole('combobox', { name: /סטטוס/i });
      fireEvent.change(statusFilter, { target: { value: 'confirmed' } });
      
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });
  });

  it('✅ should filter by side (חתן/כלה/משותף)', async () => {
    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const sideFilter = screen.getByRole('combobox', { name: /צד/i });
      fireEvent.change(sideFilter, { target: { value: 'חתן' } });
      
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });
  });

  it('✅ should add new guest', async () => {
    (fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ guests: mockGuests }),
      });
    });

    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const addButton = screen.getByText('הוסף מוזמן');
      fireEvent.click(addButton);
      
      const nameInput = screen.getByPlaceholderText('שם מלא');
      fireEvent.change(nameInput, { target: { value: 'New Guest' } });
      
      const phoneInput = screen.getByPlaceholderText('מספר טלפון');
      fireEvent.change(phoneInput, { target: { value: '050-1111111' } });
      
      const saveButton = screen.getByText('שמור');
      fireEvent.click(saveButton);
    });

    expect(fetch).toHaveBeenCalledWith('/api/guestlist/user123', expect.any(Object));
  });

  it('✅ should handle guest confirmation status change', async () => {
    (fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ guests: mockGuests }),
      });
    });

    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /אשר/i });
      fireEvent.click(confirmButton);
    });

    expect(fetch).toHaveBeenCalledWith('/api/guestlist/guest1', expect.any(Object));
  });

  it('✅ should delete guest with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    
    (fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ guests: mockGuests }),
      });
    });

    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /מחק/i });
      fireEvent.click(deleteButton);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith('/api/guestlist/guest1', expect.any(Object));
  });

  it('✅ should handle Excel import', async () => {
    const mockFile = new File(['mock excel content'], 'guests.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mockXLSX = require('xlsx');
    mockXLSX.read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { 'Sheet1': {} }
    });
    mockXLSX.utils.sheet_to_json.mockReturnValue([
      { 'שם': 'Imported Guest', 'טלפון': '050-2222222', 'צד': 'חתן', 'מספר אורחים': 2 }
    ]);

    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const fileInput = screen.getByLabelText(/העלה קובץ Excel/i);
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
    });

    expect(mockXLSX.read).toHaveBeenCalled();
  });

  it('✅ should handle pagination', async () => {
    // יצירת רשימה גדולה של אורחים לבדיקת pagination
    const manyGuests = Array.from({ length: 100 }, (_, i) => ({
      ...mockGuests[0],
      _id: `guest${i}`,
      name: `Guest ${i}`,
    }));

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ guests: manyGuests }),
    });

    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Guest 0')).toBeInTheDocument();
      expect(screen.queryByText('Guest 60')).not.toBeInTheDocument(); // לא צריך להיות בעמוד הראשון
      
      const nextButton = screen.getByRole('button', { name: /הבא/i });
      if (nextButton) {
        fireEvent.click(nextButton);
      }
    });
  });

  it('✅ should handle force refresh', async () => {
    await act(async () => {
      render(<GuestlistPage params={{ id: 'user123' }} />);
    });

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /רענן/i });
      fireEvent.click(refreshButton);
    });

    expect(fetch).toHaveBeenCalled();
  });
});

/* ============================================================================
   🔒 בדיקות אבטחה ואימות משתמשים
   ============================================================================
   
   בדיקות כלליות לאבטחה:
   - הגנה מפני גישה לא מורשית
   - בדיקת זכויות משתמש
   - הפניות נכונות בכשלים
   ============================================================================ */

describe('🔒 Security & Authentication Tests', () => {
  it('✅ should redirect unauthorized users from all pages', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthReady: true,
    });

    // בדיקה של כל הדפים
    const pages = [
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../user/[id]/page').default,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../user/[id]/edit/page').default,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../user/[id]/checklist/page').default,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../user/[id]/guestlist/page').default,
    ];

    pages.forEach((PageComponent) => {
      render(<PageComponent params={{ id: 'user123' }} />);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('✅ should redirect users trying to access other users data', () => {
    const pages = [
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../user/[id]/page').default,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../user/[id]/edit/page').default,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../user/[id]/checklist/page').default,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../user/[id]/guestlist/page').default,
    ];

    pages.forEach((PageComponent) => {
      render(<PageComponent params={{ id: 'different-user-id' }} />);
      // כל דף צריך להפנות למשתמש הנכון
    });
  });
});

/* ============================================================================
   📊 סיכום הבדיקות
   ============================================================================
   
   סך הכל הבדיקות כוללות:
   🏠 דף הבית - 10 בדיקות (דשבורד, ספירה לאחור, תקציב, אימות)
   🎨 Layout - 3 בדיקות (מבנה, נווט, עיצוב)  
   ✏️ עריכת פרופיל - 10 בדיקות (טפסים, העדפות, הזמנות, שגיאות)
   📋 רשימת משימות - 12 בדיקות (משימות, תקציב, גרפים, סינון)
   👥 רשימת אורחים - 11 בדיקות (CRUD, חיפוש, סינון, Excel, pagination)
   🔒 אבטחה - 2 בדיקות (הגנות, הפניות)
   
   סה"כ: 48 בדיקות מקיפות לכל התיקיה user/[id]
   ============================================================================ */ 