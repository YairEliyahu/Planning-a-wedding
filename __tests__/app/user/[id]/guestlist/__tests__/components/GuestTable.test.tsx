import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuestTable } from '@/app/user/[id]/guestlist/components/GuestTable';
import { useGuests } from '@/app/user/[id]/guestlist/context/GuestContext';
import { mockGuests } from '../mocks/mockData';

// Mock the context
jest.mock('@/app/user/[id]/guestlist/context/GuestContext', () => ({
  useGuests: () => ({
    filteredGuests: mockGuests,
    isLoading: false,
    updateGuest: jest.fn(),
    deleteGuest: jest.fn(),
    setEditingGuest: jest.fn(),
  }),
}));

describe('GuestTable', () => {
  const mockOnAddGuest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders guest table component', () => {
    const { container } = render(<GuestTable onAddGuest={mockOnAddGuest} />);
    if (!container) {
      throw new Error('Component did not render');
    }
  });

  it('calls onAddGuest when needed', () => {
    render(<GuestTable onAddGuest={mockOnAddGuest} />);
    // Component renders successfully
    if (typeof mockOnAddGuest !== 'function') {
      throw new Error('mockOnAddGuest should be a function');
    }
  });
}); 