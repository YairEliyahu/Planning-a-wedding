'use client';

import React, { useState } from 'react';
import { useWeddingContext } from '../context/WeddingContext';
import { 
  WeddingPreferences,
  VenueTypeOption,
  TimeOfDayOption,
  LocationPreferenceOption 
} from '../types/wedding.types';

const styles = {
  label: {
    fontWeight: 500,
    color: '#be185d',
    fontSize: '1rem',
    marginBottom: '0.2rem',
    display: 'block',
  },
  input: {
    border: '1.5px solid #fbcfe8',
    borderRadius: '999px',
    padding: '0.7rem 1.2rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#fff',
    color: '#be185d',
    fontWeight: 500,
    boxShadow: '0 1px 4px 0 #fbcfe8',
    width: '100%',
  },
  select: {
    border: '1.5px solid #fbcfe8',
    borderRadius: '999px',
    padding: '0.7rem 1.2rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#fff',
    color: '#be185d',
    fontWeight: 500,
    boxShadow: '0 1px 4px 0 #fbcfe8',
    width: '100%',
  },
  button: {
    background: 'linear-gradient(90deg, #f472b6 0%, #f9a8d4 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    padding: '0.9rem 2.2rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px 0 #fbcfe8',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  buttonHover: {
    background: 'linear-gradient(90deg, #f472b6 0%, #be185d 100%)',
    boxShadow: '0 4px 16px 0 #fbcfe8',
    transform: 'scale(1.04)',
  },
};

// Options for selects
const venueTypeOptions: VenueTypeOption[] = [
  { value: 'garden', label: 'גן אירועים' },
  { value: 'nature', label: 'אירוע בטבע' },
];

const timeOfDayOptions: TimeOfDayOption[] = [
  { value: 'evening', label: 'חתונת ערב' },
  { value: 'afternoon', label: 'חתונת צהריים' },
];

const locationPreferenceOptions: LocationPreferenceOption[] = [
  { value: 'south', label: 'דרום' },
  { value: 'center', label: 'מרכז' },
  { value: 'north', label: 'צפון' },
];

export default function WeddingPreferencesForm() {
  const { 
    preferences, 
    updatePreferences, 
    savePreferences, 
    isLoading,
    error 
  } = useWeddingContext();
  
  const [isButtonHover, setIsButtonHover] = useState(false);

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    updatePreferences({ [name]: value } as Partial<WeddingPreferences>);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await savePreferences();
      alert('העדפות החתונה נשמרו בהצלחה!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem'}}>
        {/* Venue Type */}
        <div>
          <label htmlFor="venueType" style={styles.label as React.CSSProperties}>
            מיקום האירוע
          </label>
          <select
            id="venueType"
            name="venueType"
            value={preferences.venueType}
            onChange={handlePreferencesChange}
            style={styles.select as React.CSSProperties}
            required
          >
            <option value="">בחרו את סוג המקום</option>
            {venueTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time of Day */}
        <div>
          <label htmlFor="timeOfDay" style={styles.label as React.CSSProperties}>
            שעת האירוע
          </label>
          <select
            id="timeOfDay"
            name="timeOfDay"
            value={preferences.timeOfDay}
            onChange={handlePreferencesChange}
            style={styles.select as React.CSSProperties}
            required
          >
            <option value="">בחרו את שעת האירוע</option>
            {timeOfDayOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Preference */}
        <div>
          <label htmlFor="locationPreference" style={styles.label as React.CSSProperties}>
            אזור בארץ
          </label>
          <select
            id="locationPreference"
            name="locationPreference"
            value={preferences.locationPreference}
            onChange={handlePreferencesChange}
            style={styles.select as React.CSSProperties}
            required
          >
            <option value="">בחרו את האזור המועדף</option>
            {locationPreferenceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Guests Count */}
        <div>
          <label htmlFor="guestsCount" style={styles.label as React.CSSProperties}>
            כמות מוזמנים משוערת
          </label>
          <input
            id="guestsCount"
            type="number"
            name="guestsCount"
            value={preferences.guestsCount}
            onChange={handlePreferencesChange}
            style={styles.input as React.CSSProperties}
            placeholder="הכניסו מספר משוער של אורחים"
            required
            min="0"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <button
          type="submit"
          style={{
            ...(styles.button as React.CSSProperties),
            ...(isButtonHover ? styles.buttonHover : {}),
          }}
          onMouseEnter={() => setIsButtonHover(true)}
          onMouseLeave={() => setIsButtonHover(false)}
          disabled={isLoading}
        >
          {isLoading ? 'שומר העדפות...' : 'שמירת העדפות'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'linear-gradient(90deg, #fca5a5 0%, #fbcfe8 100%)',
          color: '#b91c1c',
          borderRadius: '999px',
          padding: '0.8rem 1.2rem',
          textAlign: 'center',
          fontWeight: 700,
          marginTop: '1rem',
          fontSize: '1rem',
          border: '1.5px solid #fca5a5',
          boxShadow: '0 2px 8px 0 #fca5a5',
        }}>
          {error}
        </div>
      )}
    </form>
  );
} 