'use client';

import React from 'react';
import { useEditProfile } from '../context/EditProfileContext';
import { styles } from '../styles/formStyles';
import { ProfileFormData } from '../types/profile';

const preferenceLabels: Record<keyof ProfileFormData['preferences'], string> = {
  venue: 'אולם אירועים',
  catering: 'קייטרינג',
  photography: 'צילום',
  music: 'מוזיקה',
  design: 'עיצוב',
};

export default function PreferencesSection() {
  const { formData, handlePreferenceChange } = useEditProfile();

  return (
    <div style={styles.preferencesSection}>
      <h3 style={styles.sectionTitle}>שירותים נדרשים</h3>
      <div style={styles.preferencesGrid}>
        {Object.entries(formData.preferences).map(([key, value]) => (
          <label key={key} style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={value}
              onChange={() => handlePreferenceChange(key as keyof ProfileFormData['preferences'])}
              style={styles.checkbox}
            />
            <span style={styles.checkboxText}>
              {preferenceLabels[key as keyof ProfileFormData['preferences']]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
} 