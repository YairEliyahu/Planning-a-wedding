'use client';

import React, { useState } from 'react';
import { useEditProfile } from '../context/EditProfileContext';
import { styles } from '../styles/formStyles';
import PartnerInviteSection from './PartnerInviteSection';
import { validatePartnerName, validatePartnerPhone } from '../utils/validationUtils';

export default function WeddingDetailsSection() {
  const { formData, handleChange } = useEditProfile();
  const [partnerNameError, setPartnerNameError] = useState('');
  const [partnerPhoneError, setPartnerPhoneError] = useState('');

  const handlePartnerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange(e);
    
    // Validate partner name
    const validation = validatePartnerName(value);
    setPartnerNameError(validation.isValid ? '' : validation.message);
  };

  const handlePartnerPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange(e);
    
    // Validate partner phone
    const validation = validatePartnerPhone(value);
    setPartnerPhoneError(validation.isValid ? '' : validation.message);
  };

  const errorStyle = {
    color: '#e53e3e',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
    display: 'block'
  };

  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>פרטי האירוע</h3>
      
      <div style={styles.fieldContainer}>
        <label htmlFor="venueType" style={styles.label}>מיקום האירוע</label>
        <select
          id="venueType"
          name="venueType"
          value={formData.venueType}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">בחרו את סוג המקום</option>
          <option value="garden">גן אירועים</option>
          <option value="nature">אירוע בטבע</option>
        </select>
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="timeOfDay" style={styles.label}>שעת האירוע</label>
        <select
          id="timeOfDay"
          name="timeOfDay"
          value={formData.timeOfDay}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">בחרו את שעת האירוע</option>
          <option value="evening">חתונת ערב</option>
          <option value="afternoon">חתונת צהריים</option>
        </select>
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="locationPreference" style={styles.label}>אזור בארץ</label>
        <select
          id="locationPreference"
          name="locationPreference"
          value={formData.locationPreference}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">בחרו את האזור המועדף</option>
          <option value="south">דרום</option>
          <option value="center">מרכז</option>
          <option value="north">צפון</option>
        </select>
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="weddingDate" style={styles.label}>תאריך החתונה</label>
        <input
          id="weddingDate"
          type="date"
          name="weddingDate"
          value={formData.weddingDate}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="partnerName" style={styles.label}>שם בן/בת הזוג</label>
        <input
          id="partnerName"
          type="text"
          name="partnerName"
          value={formData.partnerName}
          onChange={handlePartnerNameChange}
          style={{
            ...styles.input,
            borderColor: partnerNameError ? '#e53e3e' : styles.input.borderColor
          }}
        />
        {partnerNameError && (
          <span style={errorStyle}>{partnerNameError}</span>
        )}
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="partnerPhone" style={styles.label}>טלפון בן/בת הזוג</label>
        <input
          id="partnerPhone"
          type="tel"
          name="partnerPhone"
          value={formData.partnerPhone}
          onChange={handlePartnerPhoneChange}
          style={{
            ...styles.input,
            borderColor: partnerPhoneError ? '#e53e3e' : styles.input.borderColor
          }}
        />
        {partnerPhoneError && (
          <span style={errorStyle}>{partnerPhoneError}</span>
        )}
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="expectedGuests" style={styles.label}>מספר אורחים משוער</label>
        <input
          id="expectedGuests"
          type="number"
          name="expectedGuests"
          value={formData.expectedGuests}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="budget" style={styles.label}>תקציב משוער</label>
        <input
          id="budget"
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <PartnerInviteSection />
    </div>
  );
} 