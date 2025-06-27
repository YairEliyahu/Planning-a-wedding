'use client';

import React from 'react';
import { useEditProfile } from '../context/EditProfileContext';
import { styles } from '../styles/formStyles';

export default function PersonalDetailsSection() {
  const { formData, handleChange, profile } = useEditProfile();

  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>פרטים אישיים</h3>
      
      <div style={styles.fieldContainer}>
        <label htmlFor="fullName" style={styles.label}>שם מלא</label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="phone" style={styles.label}>טלפון</label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          style={styles.input}
          required
        />
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="email" style={styles.label}>אימייל</label>
        <input
          id="email"
          type="email"
          value={profile?.email || ''}
          style={{ ...styles.input, backgroundColor: '#f5f5f5' }}
          disabled
        />
      </div>
    </div>
  );
} 