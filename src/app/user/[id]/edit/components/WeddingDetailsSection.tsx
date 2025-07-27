'use client';

import React from 'react';
import { useEditProfile } from '../context/EditProfileContext';
import { styles } from '../styles/formStyles';
import PartnerInviteSection from './PartnerInviteSection';

export default function WeddingDetailsSection() {
  const { formData, handleChange } = useEditProfile();

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
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldContainer}>
        <label htmlFor="partnerPhone" style={styles.label}>טלפון בן/בת הזוג</label>
        <input
          id="partnerPhone"
          type="tel"
          name="partnerPhone"
          value={formData.partnerPhone}
          onChange={handleChange}
          style={styles.input}
        />
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