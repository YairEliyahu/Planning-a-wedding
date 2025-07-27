import { ApiGuest, Guest } from '../types';

export interface GuestsResponse {
  success: boolean;
  guests: ApiGuest[];
  error?: string;
}

export const guestService = {
  /**
   * Fetch all guests for a specific user
   */
  fetchGuests: async (userId: string): Promise<GuestsResponse> => {
    const headers = {
      'Accept': 'application/json',
      'Cache-Control': 'max-age=120', // 2 minutes cache
    };

    const response = await fetch(`/api/guests?userId=${userId}`, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch guests`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch guests');
    }
    
    return data;
  },

  /**
   * Transform API guest data to internal Guest format
   */
  transformApiGuestsToGuests: (apiGuests: ApiGuest[]): Guest[] => {
    return apiGuests.map((guest: ApiGuest) => ({
      _id: guest._id,
      userId: guest.userId,
      name: guest.name,
      phoneNumber: guest.phoneNumber,
      numberOfGuests: guest.numberOfGuests || 1,
      side: guest.side,
      isConfirmed: guest.isConfirmed,
      notes: guest.notes || '',
      group: guest.group,
    }));
  },

  /**
   * Count confirmed guests including their companions
   */
  getConfirmedGuestsCount: (guests: Guest[]): number => {
    return guests
      .filter(guest => guest.isConfirmed === true)
      .reduce((total, guest) => total + guest.numberOfGuests, 0);
  },

  /**
   * Get available groups from confirmed guests
   */
  getAvailableGroups: (guests: Guest[]): string[] => {
    const confirmedGuests = guests.filter(g => g.isConfirmed === true);
    const groups = confirmedGuests.map(g => g.group).filter(Boolean) as string[];
    return Array.from(new Set(groups)).sort();
  },

  /**
   * Get guests by side and group
   */
  getGuestsBySideAndGroup: (guests: Guest[], side: string, group: string): Guest[] => {
    return guests.filter(g => 
      g.isConfirmed === true && 
      g.side === side && 
      g.group === group
    );
  },

  /**
   * Get guest status display information
   */
  getGuestStatusInfo: (guest: Guest) => {
    if (guest.isConfirmed === true) {
      return {
        text: 'מאושר',
        emoji: '✅',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (guest.isConfirmed === false) {
      return {
        text: 'סירב',
        emoji: '❌',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        text: 'ממתין',
        emoji: '⏳',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }
  },

  /**
   * Filter guests based on search query, side, and status
   */
  filterGuests: (
    guests: Guest[], 
    searchQuery: string, 
    sideFilter: 'all' | 'חתן' | 'כלה' | 'משותף', 
    statusFilter: 'all' | 'confirmed' | 'pending' | 'declined'
  ): Guest[] => {
    return guests.filter(guest => {
      // Filter by search query
      if (searchQuery && 
          !guest.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !guest.phoneNumber?.includes(searchQuery)) {
        return false;
      }
      
      // Filter by side
      if (sideFilter !== 'all' && guest.side !== sideFilter) {
        return false;
      }
      
      // Filter by status
      if (statusFilter === 'confirmed' && guest.isConfirmed !== true) return false;
      if (statusFilter === 'pending' && guest.isConfirmed !== null) return false;
      if (statusFilter === 'declined' && guest.isConfirmed !== false) return false;
      
      return true;
    });
  }
};

// React Query keys for guest-related queries
export const guestKeys = {
  all: ['guests'] as const,
  byUser: (userId: string) => ['guests', userId] as const,
  filtered: (userId: string, filters: { search?: string; side?: string; status?: string }) => 
    ['guests', userId, 'filtered', filters] as const,
}; 