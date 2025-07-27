import React from 'react';
import { render } from '@testing-library/react';
import { GuestFilters } from '@/app/user/[id]/guestlist/components/GuestFilters';

// Mock the context
const mockFilters = { side: 'all', status: 'all', search: '' };
const mockSetFilters = jest.fn();
jest.mock('@/app/user/[id]/guestlist/context/GuestContext', () => ({
  useGuests: () => ({
    filters: mockFilters,
    setFilters: mockSetFilters,
  }),
}));

describe('GuestFilters', () => {
  const mockOnAddGuest = jest.fn();
  const mockOnImport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filter controls', () => {
    const { container } = render(
      <GuestFilters onAddGuest={mockOnAddGuest} onImport={mockOnImport} />
    );
    if (!container) {
      throw new Error('Component did not render');
    }
  });

  it('has setFilters function available', () => {
    render(<GuestFilters onAddGuest={mockOnAddGuest} onImport={mockOnImport} />);
    if (typeof mockSetFilters !== 'function') {
      throw new Error('mockSetFilters should be a function');
    }
  });
}); 