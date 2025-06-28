'use client';

import React from 'react';
import { useEditProfile } from '../context/EditProfileContext';
import { styles } from '../styles/formStyles';

export default function PartnerInviteSection() {
  const { 
    formData, 
    handleChange, 
    invitePartner, 
    inviteStatus, 
    inviteMessage, 
    isInviting 
  } = useEditProfile();

  const getButtonStyle = () => ({
    padding: '0.75rem',
    borderRadius: '4px 0 0 4px',
    border: '1px solid',
    fontSize: '0.9rem',
    width: '150px',
    transition: 'all 0.3s ease',
    cursor: inviteStatus === 'sending' || inviteStatus === 'accepted' || !formData.partnerEmail ? 'not-allowed' : 'pointer',
    backgroundColor: 
      inviteStatus === 'accepted' ? '#4CAF50' :
      inviteStatus === 'sent' ? '#FFA500' : 
      inviteStatus === 'sending' ? '#cccccc' : 
      inviteStatus === 'error' ? '#f44336' : 
      '#0070f3',
    borderColor: 
      inviteStatus === 'accepted' ? '#388E3C' :
      inviteStatus === 'sent' ? '#FF8C00' : 
      inviteStatus === 'sending' ? '#bbbbbb' : 
      inviteStatus === 'error' ? '#D32F2F' : 
      '#0062cc',
    color: 'white',
  });

  const getButtonText = () => {
    switch (inviteStatus) {
      case 'accepted':
        return '✓ מחובר';
      case 'sent':
        return 'שלח שוב';
      case 'sending':
        return '...שולח';
      case 'error':
        return 'נסה שוב';
      default:
        return 'שלח הזמנה';
    }
  };

  return (
    <div style={styles.partnerEmailContainer}>
      <label htmlFor="partnerEmail" style={styles.label}>אימייל בן/בת הזוג</label>
      <div style={styles.partnerEmailWrapper}>
        <input
          id="partnerEmail"
          type="email"
          name="partnerEmail"
          value={formData.partnerEmail}
          onChange={handleChange}
          style={{
            ...styles.input,
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            borderRight: '1px solid #ddd',
            width: 'calc(100% - 150px)'
          }}
        />
        <button
          type="button"
          onClick={invitePartner}
          disabled={isInviting || inviteStatus === 'accepted' || !formData.partnerEmail}
          style={getButtonStyle()}
        >
          {getButtonText()}
        </button>
      </div>
      {inviteStatus === 'sent' && (
        <p style={styles.inviteMessage}>{inviteMessage}</p>
      )}
      {inviteStatus === 'accepted' && (
        <p style={styles.inviteMessageSuccess}>{inviteMessage}</p>
      )}
    </div>
  );
} 