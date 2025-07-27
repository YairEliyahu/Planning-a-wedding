'use client';

import React from 'react';
import { useWeddingContext } from '../context/WeddingContext';
import { WeddingPreferences } from '../types/wedding.types';

const styles = {
  card: {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(8px)',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px 0 rgba(245, 158, 158, 0.12)',
    border: '1.5px solid #fbcfe8',
    padding: '2rem',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#be185d',
    marginBottom: '1.2rem',
    letterSpacing: '0.01em',
    textAlign: 'center',
  },
  preferencesText: {
    fontWeight: 600,
    color: '#be185d',
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
  guestsText: {
    fontSize: '1rem',
    color: '#be185d',
    margin: 0,
  },
};

interface WeddingPreferencesSummaryProps {
  className?: string;
}

export default function WeddingPreferencesSummary({ className }: WeddingPreferencesSummaryProps) {
  const { savedPreferences } = useWeddingContext();

  if (!savedPreferences) {
    return null;
  }

  const getPreferenceText = (preferences: WeddingPreferences) => {
    const venueTypes = { 
      garden: 'גן אירועים', 
      nature: 'אירוע בטבע' 
    };
    const times = { 
      evening: 'בשעות הערב', 
      afternoon: 'בשעות הצהריים' 
    };
    const locations = { 
      south: 'בדרום', 
      center: 'במרכז', 
      north: 'בצפון' 
    };

    const venue = preferences.venueType ? venueTypes[preferences.venueType] : '';
    const time = preferences.timeOfDay ? times[preferences.timeOfDay] : '';
    const location = preferences.locationPreference ? locations[preferences.locationPreference] : '';

    if (!venue && !time && !location) {
      return 'טרם נבחרו העדפות';
    }

    return `${venue} ${time} ${location}`.trim();
  };

  return (
    <div 
      style={{
        ...styles.card,
        marginTop: 0,
      } as React.CSSProperties}
      className={className}
    >
      <h2 style={styles.sectionTitle as React.CSSProperties}>
        סיכום העדפות החתונה שלכם:
      </h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        <p style={styles.preferencesText as React.CSSProperties}>
          {getPreferenceText(savedPreferences)}
        </p>
        <p style={styles.guestsText as React.CSSProperties}>
          מספר אורחים משוער: {savedPreferences.guestsCount || 'לא צוין'}
        </p>
      </div>
    </div>
  );
} 