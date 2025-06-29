import { Guest, NewGuest } from '../../context/GuestContext';

export const mockGuest: Guest = {
  _id: 'guest-1',
  name: 'ישראל ישראלי',
  phoneNumber: '050-1234567',
  numberOfGuests: 2,
  side: 'חתן',
  isConfirmed: true,
  notes: 'הערות לדוגמה',
  group: 'משפחה',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  sharedEventId: 'shared-event-1',
};

export const mockGuests: Guest[] = [
  mockGuest,
  {
    _id: 'guest-2',
    name: 'שרה כהן',
    phoneNumber: '052-9876543',
    numberOfGuests: 1,
    side: 'כלה',
    isConfirmed: false,
    notes: '',
    group: 'חברים',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    _id: 'guest-3',
    name: 'דוד לוי',
    phoneNumber: '054-5555555',
    numberOfGuests: 3,
    side: 'משותף',
    isConfirmed: null,
    notes: 'צריך לאשר',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

export const mockNewGuest: NewGuest = {
  name: 'אורח חדש',
  phoneNumber: '053-1111111',
  numberOfGuests: 1,
  side: 'חתן',
  isConfirmed: null,
  notes: '',
  group: 'עבודה',
};

export const mockApiResponse = {
  success: true,
  guests: mockGuests,
  message: 'Guests fetched successfully',
};

export const mockImportResponse = {
  success: 5,
  error: 2,
  errorDetails: {
    missingName: 1,
    invalidPhone: 1,
    apiErrors: 0,
    otherErrors: 0,
  },
};

export const mockStats = {
  totalCount: 3,
  confirmedCount: 1,
  declinedCount: 1,
  pendingCount: 1,
  totalGuests: 6,
  confirmedGuests: 2,
};

export const mockFilters = {
  filter: 'all' as const,
  sideFilter: 'all' as const,
  searchQuery: '',
};

// Mock file for import tests
export const createMockFile = (name: string = 'test.xlsx', content: string = 'mock content') => {
  const file = new File([content], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return file;
};

// Mock Excel data
export const mockExcelData = [
  ['שם המוזמן', 'מספר טלפון', 'מספר מוזמנים', 'צד', 'מאושר', 'הערות', 'קבוצה'],
  ['ישראל ישראלי', '050-1234567', '2', 'חתן', 'כן', 'הערות', 'משפחה'],
  ['שרה כהן', '052-9876543', '1', 'כלה', 'לא', '', 'חברים'],
  ['דוד לוי', '054-5555555', '3', 'משותף', '', 'צריך לאשר', ''],
]; 