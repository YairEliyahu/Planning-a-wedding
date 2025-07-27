'use client';

import React from 'react';
import { useEditProfile } from '../context/EditProfileContext';
import { styles } from '../styles/formStyles';

export default function ProfileImageSection() {
  const { profile } = useEditProfile();

  if (!profile?.authProvider || profile.authProvider !== 'google' || !profile.profilePicture) {
    return null;
  }

  return (
    <div style={styles.profileImageContainer}>
      <img 
        src={profile.profilePicture} 
        alt="Profile" 
        style={styles.profileImage}
      />
    </div>
  );
} 