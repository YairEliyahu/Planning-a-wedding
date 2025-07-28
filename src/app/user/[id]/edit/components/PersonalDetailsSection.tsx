'use client';

import React, { useState } from 'react';
import { useEditProfile } from '../context/EditProfileContext';
import { styles } from '../styles/formStyles';
import { validatePartnerPhone } from '../utils/validationUtils';

export default function PersonalDetailsSection() {
  const { formData, handleChange, profile } = useEditProfile();
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange(e);
    
    // Validate phone number using the same validation as partner phone
    // (since the validation logic is the same for Israeli phone numbers)
    const validation = validatePartnerPhone(value);
    setPhoneError(validation.isValid ? '' : validation.message.replace('בן/בת הזוג', 'המשתמש'));
  };

  const errorStyle = {
    color: '#e53e3e',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
    display: 'block'
  };

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
          onChange={handlePhoneChange}
          style={{
            ...styles.input,
            borderColor: phoneError ? '#e53e3e' : styles.input.borderColor
          }}
          required
        />
        {phoneError && (
          <span style={errorStyle}>{phoneError}</span>
        )}
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