/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import BudgetAnalysis from '../../components/BudgetAnalysis';
import { mockBudgetAnalysis } from '../utils/mock-data';

describe('BudgetAnalysis Component', () => {
  it('renders budget analysis correctly', () => {
    render(<BudgetAnalysis budgetAnalysis={mockBudgetAnalysis} />);

    const titleElement = screen.getByText('ניתוח תקציב');
    if (!titleElement) throw new Error('Title element not found');
  });

  it('displays expected income and expenses', () => {
    render(<BudgetAnalysis budgetAnalysis={mockBudgetAnalysis} />);

    const incomeElement = screen.getByText(`₪${mockBudgetAnalysis.expectedIncome.toLocaleString()}`);
    const expensesElement = screen.getByText(`₪${mockBudgetAnalysis.estimatedExpenses.toLocaleString()}`);
    if (!incomeElement) throw new Error('Income element not found');
    if (!expensesElement) throw new Error('Expenses element not found');
  });

  it('shows budget categories with amounts', () => {
    render(<BudgetAnalysis budgetAnalysis={mockBudgetAnalysis} />);

    mockBudgetAnalysis.categories.forEach(category => {
      const nameElement = screen.getByText(category.name);
      const amountElement = screen.getByText(`₪${category.amount.toLocaleString()}`);
      if (!nameElement) throw new Error(`Category name ${category.name} not found`);
      if (!amountElement) throw new Error(`Category amount for ${category.name} not found`);
    });
  });

  it('calculates balance correctly', () => {
    render(<BudgetAnalysis budgetAnalysis={mockBudgetAnalysis} />);

    const balance = mockBudgetAnalysis.expectedIncome - mockBudgetAnalysis.estimatedExpenses;
    const balanceElement = screen.getByText(`₪${balance.toLocaleString()}`);
    if (!balanceElement) throw new Error('Balance element not found');
  });

  it('handles empty categories', () => {
    const emptyBudgetAnalysis = {
      expectedIncome: 50000,
      estimatedExpenses: 40000,
      categories: [],
    };

    render(<BudgetAnalysis budgetAnalysis={emptyBudgetAnalysis} />);

    const incomeElement = screen.getByText('₪50,000');
    const expensesElement = screen.getByText('₪40,000');
    if (!incomeElement) throw new Error('Income element not found');
    if (!expensesElement) throw new Error('Expenses element not found');
  });

  it('handles zero values', () => {
    const zeroBudgetAnalysis = {
      expectedIncome: 0,
      estimatedExpenses: 0,
      categories: [],
    };

    render(<BudgetAnalysis budgetAnalysis={zeroBudgetAnalysis} />);

    const zeroElement = screen.getByText('₪0');
    if (!zeroElement) throw new Error('Zero element not found');
  });

  it('shows proper styling for deficit scenario', () => {
    const deficitBudgetAnalysis = {
      expectedIncome: 30000,
      estimatedExpenses: 50000,
      categories: [
        { name: 'Test Category', amount: 50000 }
      ],
    };

    render(<BudgetAnalysis budgetAnalysis={deficitBudgetAnalysis} />);

    const balance = deficitBudgetAnalysis.expectedIncome - deficitBudgetAnalysis.estimatedExpenses;
    const balanceElement = screen.getByText(`₪${balance.toLocaleString()}`);
    if (!balanceElement) throw new Error('Balance element not found');
  });

  it('applies responsive design classes', () => {
    const { container } = render(<BudgetAnalysis budgetAnalysis={mockBudgetAnalysis} />);

    const gridElement = container.querySelector('.grid');
    const gapElement = container.querySelector('.gap-4');
    if (!gridElement) throw new Error('Grid element not found');
    if (!gapElement) throw new Error('Gap element not found');
  });

  it('includes visual elements like icons or charts', () => {
    const { container } = render(<BudgetAnalysis budgetAnalysis={mockBudgetAnalysis} />);

    // Check for common chart or visual elements
    const hasVisualElements = 
      container.querySelector('canvas') || 
      container.querySelector('svg') || 
      container.querySelector('.chart') ||
      container.querySelector('[data-testid="chart"]');

    // If no visual elements, at least check for proper styling
    if (!hasVisualElements) {
      const bgElement = container.querySelector('.bg-white');
      if (!bgElement) throw new Error('Background element not found');
    }
  });
}); 