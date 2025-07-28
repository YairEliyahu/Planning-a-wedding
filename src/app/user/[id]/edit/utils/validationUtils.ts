// Validation utilities for partner fields

/**
 * Validates partner name - should contain only letters, spaces, and Hebrew characters
 * No numbers allowed
 */
export const validatePartnerName = (name: string): { isValid: boolean; message: string } => {
  if (!name.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }

  // Hebrew letters, English letters, spaces, apostrophes, hyphens
  const nameRegex = /^[\u0590-\u05FFa-zA-Z\s'-]+$/;
  
  if (!nameRegex.test(name)) {
    return { 
      isValid: false, 
      message: 'שם בן/בת הזוג יכול להכיל רק אותיות, רווחים וסימנים מיוחדים (לא מספרים)' 
    };
  }

  if (name.trim().length < 2) {
    return { 
      isValid: false, 
      message: 'שם בן/בת הזוג חייב להכיל לפחות 2 תווים' 
    };
  }

  if (name.trim().length > 50) {
    return { 
      isValid: false, 
      message: 'שם בן/בת הזוג לא יכול להיות ארוך מ-50 תווים' 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates partner phone number - Israeli phone formats
 * Mobile: 05X-XXXXXXX (10 digits: 05 + 8 digits)
 * Landline: 0X-XXXXXXX (9 digits: 0 + area code + 7 digits)
 */
export const validatePartnerPhone = (phone: string): { isValid: boolean; message: string } => {
  if (!phone.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }

  // Clean phone number (remove spaces, hyphens, etc.)
  const cleanPhone = phone.replace(/[-\s()]/g, '');
  
  // Israeli mobile: 05X-XXXXXXX (10 digits total)
  const mobileRegex = /^05[0-9]{8}$/;
  // Israeli landline: 0X-XXXXXXX (9 digits total)
  const landlineRegex = /^0[2-4,8-9][0-9]{7}$/;
  
  if (!mobileRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) {
    return { 
      isValid: false, 
      message: 'מספר טלפון לא תקין. דוגמאות: 0501234567 (נייד) או 026789012 (קווי)' 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates partner email address
 */
export const validatePartnerEmail = (email: string): { isValid: boolean; message: string } => {
  if (!email.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      message: 'כתובת מייל לא תקינה. דוגמה: example@domain.com' 
    };
  }

  // Check for common email validation rules
  if (email.length > 254) {
    return { 
      isValid: false, 
      message: 'כתובת מייל ארוכה מדי' 
    };
  }

  // Check for Hebrew characters in email (not allowed)
  if (/[\u0590-\u05FF]/.test(email)) {
    return { 
      isValid: false, 
      message: 'כתובת מייל לא יכולה להכיל תווים בעברית' 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates all partner fields together
 */
export const validatePartnerFields = (partnerData: {
  partnerName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (partnerData.partnerName) {
    const nameValidation = validatePartnerName(partnerData.partnerName);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.message);
    }
  }

  if (partnerData.partnerPhone) {
    const phoneValidation = validatePartnerPhone(partnerData.partnerPhone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.message);
    }
  }

  if (partnerData.partnerEmail) {
    const emailValidation = validatePartnerEmail(partnerData.partnerEmail);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 