'use client';

import React from 'react';
import { useEditProfile } from '../context/EditProfileContext';
import { styles } from '../styles/formStyles';

export default function MessageDisplay() {
  const { successMessage, errorMessage } = useEditProfile();

  return (
    <>
      {successMessage && (
        <div style={styles.successMessage}>{successMessage}</div>
      )}
      
      {errorMessage && (
        <div style={styles.errorMessage}>{errorMessage}</div>
      )}
    </>
  );
} 