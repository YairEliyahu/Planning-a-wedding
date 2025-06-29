import { guestService } from '../../services/guestService';
import { createMockGuest } from '../setup/testUtils';

describe('GuestService', () => {
  describe('getConfirmedGuestsCount', () => {
    it('should count confirmed guests correctly', () => {
      const guests = [
        createMockGuest({ isConfirmed: true, numberOfGuests: 2 }),
        createMockGuest({ isConfirmed: true, numberOfGuests: 1 }),
        createMockGuest({ isConfirmed: false, numberOfGuests: 3 }),
        createMockGuest({ isConfirmed: null, numberOfGuests: 1 }),
      ];
      
      const count = guestService.getConfirmedGuestsCount(guests);
      
      if (count !== 3) { // 2 + 1 from confirmed guests
        throw new Error(`Expected 3 confirmed guests, got ${count}`);
      }
    });

    it('should return 0 for no confirmed guests', () => {
      const guests = [
        createMockGuest({ isConfirmed: false }),
        createMockGuest({ isConfirmed: null }),
      ];
      
      const count = guestService.getConfirmedGuestsCount(guests);
      
      if (count !== 0) {
        throw new Error(`Expected 0 confirmed guests, got ${count}`);
      }
    });
  });

  describe('getAvailableGroups', () => {
    it('should return unique groups from confirmed guests', () => {
      const guests = [
        createMockGuest({ isConfirmed: true, group: 'משפחה' }),
        createMockGuest({ isConfirmed: true, group: 'חברים' }),
        createMockGuest({ isConfirmed: true, group: 'משפחה' }), // duplicate
        createMockGuest({ isConfirmed: false, group: 'עבודה' }), // not confirmed
        createMockGuest({ isConfirmed: true, group: undefined }), // no group
      ];
      
      const groups = guestService.getAvailableGroups(guests);
      
      if (groups.length !== 2) {
        throw new Error(`Expected 2 groups, got ${groups.length}`);
      }
      
      if (!groups.includes('חברים')) {
        throw new Error('Should include חברים group');
      }
      
      if (!groups.includes('משפחה')) {
        throw new Error('Should include משפחה group');
      }
    });
  });

  describe('getGuestsBySideAndGroup', () => {
    it('should filter guests by side and group', () => {
      const guests = [
        createMockGuest({ isConfirmed: true, side: 'חתן', group: 'משפחה' }),
        createMockGuest({ isConfirmed: true, side: 'כלה', group: 'משפחה' }),
        createMockGuest({ isConfirmed: true, side: 'חתן', group: 'חברים' }),
        createMockGuest({ isConfirmed: false, side: 'חתן', group: 'משפחה' }),
      ];
      
      const filtered = guestService.getGuestsBySideAndGroup(guests, 'חתן', 'משפחה');
      
      if (filtered.length !== 1) {
        throw new Error(`Expected 1 guest, got ${filtered.length}`);
      }
      
      if (filtered[0].side !== 'חתן') {
        throw new Error('Guest should be from groom side');
      }
      
      if (filtered[0].group !== 'משפחה') {
        throw new Error('Guest should be from family group');
      }
      
      if (filtered[0].isConfirmed !== true) {
        throw new Error('Guest should be confirmed');
      }
    });
  });

  describe('getGuestStatusInfo', () => {
    it('should return correct info for confirmed guest', () => {
      const guest = createMockGuest({ isConfirmed: true });
      const info = guestService.getGuestStatusInfo(guest);
      
      if (info.text !== 'מאושר') {
        throw new Error(`Expected text 'מאושר', got ${info.text}`);
      }
      
      if (info.emoji !== '✅') {
        throw new Error(`Expected emoji ✅, got ${info.emoji}`);
      }
      
      if (info.color !== 'text-green-600') {
        throw new Error(`Expected color text-green-600, got ${info.color}`);
      }
    });

    it('should return correct info for declined guest', () => {
      const guest = createMockGuest({ isConfirmed: false });
      const info = guestService.getGuestStatusInfo(guest);
      
      if (info.text !== 'סירב') {
        throw new Error(`Expected text 'סירב', got ${info.text}`);
      }
      
      if (info.emoji !== '❌') {
        throw new Error(`Expected emoji ❌, got ${info.emoji}`);
      }
      
      if (info.color !== 'text-red-600') {
        throw new Error(`Expected color text-red-600, got ${info.color}`);
      }
    });

    it('should return correct info for pending guest', () => {
      const guest = createMockGuest({ isConfirmed: null });
      const info = guestService.getGuestStatusInfo(guest);
      
      if (info.text !== 'ממתין') {
        throw new Error(`Expected text 'ממתין', got ${info.text}`);
      }
      
      if (info.emoji !== '⏳') {
        throw new Error(`Expected emoji ⏳, got ${info.emoji}`);
      }
      
      if (info.color !== 'text-orange-600') {
        throw new Error(`Expected color text-orange-600, got ${info.color}`);
      }
    });
  });

  describe('filterGuests', () => {
    const guests = [
      createMockGuest({ 
        name: 'דוד כהן', 
        phoneNumber: '050-1234567',
        side: 'חתן', 
        isConfirmed: true 
      }),
      createMockGuest({ 
        name: 'שרה לוי', 
        phoneNumber: '052-9876543',
        side: 'כלה', 
        isConfirmed: false 
      }),
      createMockGuest({ 
        name: 'יוסי אברהם', 
        phoneNumber: '054-5555555',
        side: 'משותף', 
        isConfirmed: null 
      }),
    ];

    it('should filter by search query (name)', () => {
      const filtered = guestService.filterGuests(guests, 'דוד', 'all', 'all');
      
      if (filtered.length !== 1) {
        throw new Error(`Expected 1 guest, got ${filtered.length}`);
      }
      
      if (filtered[0].name !== 'דוד כהן') {
        throw new Error(`Expected דוד כהן, got ${filtered[0].name}`);
      }
    });

    it('should filter by side', () => {
      const filtered = guestService.filterGuests(guests, '', 'חתן', 'all');
      
      if (filtered.length !== 1) {
        throw new Error(`Expected 1 guest, got ${filtered.length}`);
      }
      
      if (filtered[0].side !== 'חתן') {
        throw new Error(`Expected side חתן, got ${filtered[0].side}`);
      }
    });

    it('should filter by status', () => {
      const confirmed = guestService.filterGuests(guests, '', 'all', 'confirmed');
      const pending = guestService.filterGuests(guests, '', 'all', 'pending');
      const declined = guestService.filterGuests(guests, '', 'all', 'declined');
      
      if (confirmed.length !== 1 || confirmed[0].isConfirmed !== true) {
        throw new Error('Confirmed filter failed');
      }
      
      if (pending.length !== 1 || pending[0].isConfirmed !== null) {
        throw new Error('Pending filter failed');
      }
      
      if (declined.length !== 1 || declined[0].isConfirmed !== false) {
        throw new Error('Declined filter failed');
      }
    });

    it('should return empty array when no matches', () => {
      const filtered = guestService.filterGuests(guests, 'non-existent', 'all', 'all');
      
      if (filtered.length !== 0) {
        throw new Error(`Expected 0 guests, got ${filtered.length}`);
      }
    });
  });
}); 