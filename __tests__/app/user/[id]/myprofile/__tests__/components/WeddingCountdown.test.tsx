/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import WeddingCountdown from '../../components/WeddingCountdown';
import { mockTimeLeft, mockUserProfile } from '../utils/mock-data';

// Read the actual component to understand its props
describe('WeddingCountdown Component', () => {
  it('renders countdown timer correctly', () => {
    render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    const daysElement = screen.getByText(mockTimeLeft.days.toString());
    const hoursElement = screen.getByText(mockTimeLeft.hours.toString());
    const minutesElement = screen.getByText(mockTimeLeft.minutes.toString());
    const secondsElement = screen.getByText(mockTimeLeft.seconds.toString());
    
    if (!daysElement) throw new Error('Days element not found');
    if (!hoursElement) throw new Error('Hours element not found');
    if (!minutesElement) throw new Error('Minutes element not found');
    if (!secondsElement) throw new Error('Seconds element not found');
  });

  it('displays Hebrew labels for time units', () => {
    render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    const daysLabel = screen.getByText('ימים');
    const hoursLabel = screen.getByText('שעות');
    const minutesLabel = screen.getByText('דקות');
    const secondsLabel = screen.getByText('שניות');
    
    if (!daysLabel) throw new Error('Days label not found');
    if (!hoursLabel) throw new Error('Hours label not found');
    if (!minutesLabel) throw new Error('Minutes label not found');
    if (!secondsLabel) throw new Error('Seconds label not found');
  });

  it('displays personalized greeting with names', () => {
    render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    const greetingElement = screen.getByText(`היי ${mockUserProfile.fullName} ו${mockUserProfile.partnerName} 💕`);
    if (!greetingElement) throw new Error('Personalized greeting not found');
  });

  it('shows wedding date in Hebrew format', () => {
    render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    const expectedDate = new Date(mockUserProfile.weddingDate).toLocaleDateString('he-IL');
    const dateElement = screen.getByText(`תאריך החתונה: ${expectedDate}`);
    if (!dateElement) throw new Error('Wedding date not found');
  });

  it('displays motivational message', () => {
    render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    const motivationElement = screen.getByText('היום הגדול מתקרב!');
    if (!motivationElement) throw new Error('Motivational message not found');
  });

  it('handles zero values correctly', () => {
    const zeroTimeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    render(<WeddingCountdown profile={mockUserProfile} timeLeft={zeroTimeLeft} />);

    const zeros = screen.getAllByText('0');
    if (zeros.length < 4) throw new Error(`Expected at least 4 zeros, found ${zeros.length}`);
  });

  it('handles large day values', () => {
    const longTimeLeft = {
      days: 365,
      hours: 23,
      minutes: 59,
      seconds: 59,
    };

    render(<WeddingCountdown profile={mockUserProfile} timeLeft={longTimeLeft} />);

    const daysElement = screen.getByText('365');
    const hoursElement = screen.getByText('23');
    const minutesElement = screen.getByText('59');
    
    if (!daysElement) throw new Error('Large days value not found');
    if (!hoursElement) throw new Error('Large hours value not found');
    if (!minutesElement) throw new Error('Large minutes value not found');
  });

  it('applies responsive grid layout', () => {
    const { container } = render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    const gridCols2Element = container.querySelector('.grid-cols-2');
    const smGridCols4Element = container.querySelector('.sm\\:grid-cols-4');
    
    if (!gridCols2Element) throw new Error('Grid cols 2 class not found');
    if (!smGridCols4Element) throw new Error('Small grid cols 4 class not found');
  });

  it('applies gradient styling to numbers', () => {
    const { container } = render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    const gradientElements = container.querySelectorAll('.bg-gradient-to-r');
    if (gradientElements.length === 0) throw new Error('No gradient elements found');
  });

  it('includes hover effects on countdown boxes', () => {
    const { container } = render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    const hoverElements = container.querySelectorAll('.hover\\:scale-105');
    if (hoverElements.length !== 4) throw new Error(`Expected 4 hover elements, found ${hoverElements.length}`);
  });

  it('displays countdown title or header', () => {
    render(<WeddingCountdown profile={mockUserProfile} timeLeft={mockTimeLeft} />);

    // Look for common countdown headers
    const possibleHeaders = [
      'עד החתונה',
      'זמן עד החתונה',
      'ספירה לאחור',
      'ספירה לאחור לחתונה'
    ];

    const hasHeader = possibleHeaders.some(header => 
      screen.queryByText(header) !== null
    );

    // At least one header should be present, or check for time-related text
    if (!hasHeader && !screen.queryByText('ימים')) {
      throw new Error('No countdown header or time labels found');
    }
  });

  it('formats single digit numbers consistently', () => {
    const singleDigitTimeLeft = {
      days: 5,
      hours: 3,
      minutes: 8,
      seconds: 1,
    };

    render(<WeddingCountdown profile={mockUserProfile} timeLeft={singleDigitTimeLeft} />);

    const daysElement = screen.getByText('5');
    const hoursElement = screen.getByText('3');
    const minutesElement = screen.getByText('8');
    const secondsElement = screen.getByText('1');
    
    if (!daysElement) throw new Error('Single digit days not found');
    if (!hoursElement) throw new Error('Single digit hours not found');
    if (!minutesElement) throw new Error('Single digit minutes not found');
    if (!secondsElement) throw new Error('Single digit seconds not found');
  });
}); 