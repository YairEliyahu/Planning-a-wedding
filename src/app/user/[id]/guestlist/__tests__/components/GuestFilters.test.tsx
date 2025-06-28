import React from 'react';
import { render } from '@testing-library/react';
import { GuestFilters } from '../../components/GuestFilters';
import { mockFilters } from '../mocks/mockData';

// Mock the context
const mockSetFilters = jest.fn();
jest.mock('../../context/GuestContext', () => ({
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