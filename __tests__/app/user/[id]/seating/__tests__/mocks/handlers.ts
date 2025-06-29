import { http, HttpResponse } from 'msw';
import { createMockApiGuest, createMockTable } from '../setup/testUtils';

// Mock data
const mockGuests = [
  createMockApiGuest({ 
    _id: 'guest-1', 
    name: 'דוד כהן', 
    side: 'חתן', 
    isConfirmed: true,
    numberOfGuests: 2,
    group: 'משפחה'
  }),
  createMockApiGuest({ 
    _id: 'guest-2', 
    name: 'שרה לוי', 
    side: 'כלה', 
    isConfirmed: true,
    numberOfGuests: 1,
    group: 'חברים'
  }),
  createMockApiGuest({ 
    _id: 'guest-3', 
    name: 'יוסי אברהם', 
    side: 'חתן', 
    isConfirmed: null,
    numberOfGuests: 3,
    group: 'עבודה'
  }),
  createMockApiGuest({ 
    _id: 'guest-4', 
    name: 'רחל דוד', 
    side: 'כלה', 
    isConfirmed: false,
    numberOfGuests: 1,
    group: 'משפחה'
  }),
];

const mockTables = [
  createMockTable({
    id: 'table-1',
    name: 'שולחן 1',
    capacity: 12,
    x: 100,
    y: 100,
    guests: []
  }),
  createMockTable({
    id: 'table-2',
    name: 'שולחן 2',
    capacity: 12,
    x: 300,
    y: 100,
    guests: []
  }),
];

export const handlers = [
  // Get guests
  http.get('/api/guests', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      guests: mockGuests
    });
  }),

  // Get seating arrangement
  http.get('/api/seating', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        tables: mockTables,
        message: 'Seating arrangement loaded successfully'
      }
    });
  }),

  // Save seating arrangement
  http.post('/api/seating', async ({ request }) => {
    const body = await request.json() as any;
    
    if (!body?.userId || !body?.arrangement || !body?.tables) {
      return HttpResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        tables: body.tables,
        message: 'סידור ההושבה נשמר בהצלחה!'
      }
    });
  }),

  // Error scenarios for testing
  http.get('/api/guests-error', () => {
    return HttpResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.get('/api/seating-error', () => {
    return HttpResponse.json(
      { success: false, error: 'Failed to load seating arrangement' },
      { status: 500 }
    );
  }),

  http.post('/api/seating-error', () => {
    return HttpResponse.json(
      { success: false, error: 'Failed to save seating arrangement' },
      { status: 500 }
    );
  }),
];

export { mockGuests, mockTables }; 