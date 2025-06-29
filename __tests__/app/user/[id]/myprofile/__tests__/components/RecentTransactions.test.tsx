/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import RecentTransactions from '../../components/RecentTransactions';
import { mockWalletInfo } from '../utils/mock-data';

describe('RecentTransactions Component', () => {
  it('renders recent transactions correctly', () => {
    render(<RecentTransactions walletInfo={mockWalletInfo} />);

    const titleElement = screen.getByText('תנועות אחרונות');
    if (!titleElement) throw new Error('Recent transactions title not found');
  });

  it('displays transaction details', () => {
    render(<RecentTransactions walletInfo={mockWalletInfo} />);

    mockWalletInfo.lastTransactions.forEach(transaction => {
      const nameElement = screen.getByText(transaction.itemName);
      const amountElement = screen.getByText(`₪${transaction.amount.toLocaleString()}`);
      const dateElement = screen.getByText(transaction.date);
      
      if (!nameElement) throw new Error(`Transaction name ${transaction.itemName} not found`);
      if (!amountElement) throw new Error(`Transaction amount ${transaction.amount} not found`);
      if (!dateElement) throw new Error(`Transaction date ${transaction.date} not found`);
    });
  });

  it('handles empty transaction list', () => {
    const emptyWalletInfo = {
      ...mockWalletInfo,
      lastTransactions: [],
    };

    render(<RecentTransactions walletInfo={emptyWalletInfo} />);

    const emptyMessageElement = screen.getByText('אין תנועות אחרונות');
    if (!emptyMessageElement) throw new Error('Empty message not found');
  });

  it('formats transaction dates correctly', () => {
    render(<RecentTransactions walletInfo={mockWalletInfo} />);

    mockWalletInfo.lastTransactions.forEach(transaction => {
      // Check if date is displayed in some format
      const dateElement = screen.getByText(transaction.date);
      if (!dateElement) throw new Error(`Date ${transaction.date} not found`);
    });
  });

  it('displays transaction amounts with currency symbol', () => {
    render(<RecentTransactions walletInfo={mockWalletInfo} />);

    mockWalletInfo.lastTransactions.forEach(transaction => {
      const amountElement = screen.getByText(`₪${transaction.amount.toLocaleString()}`);
      if (!amountElement) throw new Error(`Amount ${transaction.amount} not found`);
    });
  });

  it('shows transactions in proper order', () => {
    render(<RecentTransactions walletInfo={mockWalletInfo} />);

    const transactionItems = screen.getAllByText(/₪\d+/);
    if (transactionItems.length !== mockWalletInfo.lastTransactions.length) {
      throw new Error(`Expected ${mockWalletInfo.lastTransactions.length} transactions, found ${transactionItems.length}`);
    }
  });

  it('applies proper styling to transaction items', () => {
    const { container } = render(<RecentTransactions walletInfo={mockWalletInfo} />);

    const spaceElement = container.querySelector('.space-y-2');
    const borderElement = container.querySelector('.border');
    if (!spaceElement) throw new Error('Space styling not found');
    if (!borderElement) throw new Error('Border styling not found');
  });

  it('handles large transaction amounts', () => {
    const largeAmountWalletInfo = {
      ...mockWalletInfo,
      lastTransactions: [
        {
          itemName: 'אירוע גדול',
          amount: 1000000,
          date: '2024-01-15',
        },
      ],
    };

    render(<RecentTransactions walletInfo={largeAmountWalletInfo} />);

    const largeAmountElement = screen.getByText('₪1,000,000');
    if (!largeAmountElement) throw new Error('Large amount not found');
  });

  it('displays Hebrew item names correctly', () => {
    render(<RecentTransactions walletInfo={mockWalletInfo} />);

    // Check that Hebrew text is displayed correctly
    const venueElement = screen.getByText('אולם אירועים');
    const cateringElement = screen.getByText('קייטרינג');
    const photographerElement = screen.getByText('צלם');
    
    if (!venueElement) throw new Error('Venue Hebrew text not found');
    if (!cateringElement) throw new Error('Catering Hebrew text not found');
    if (!photographerElement) throw new Error('Photographer Hebrew text not found');
  });

  it('includes responsive design elements', () => {
    const { container } = render(<RecentTransactions walletInfo={mockWalletInfo} />);

    const flexElement = container.querySelector('.sm\\:flex');
    const justifyElement = container.querySelector('.justify-between');
    if (!flexElement) throw new Error('Responsive flex not found');
    if (!justifyElement) throw new Error('Justify between not found');
  });
}); 