export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface GuestFormValidation {
  name: ValidationResult;
  phoneNumber: ValidationResult;
  numberOfGuests: ValidationResult;
  notes: ValidationResult;
  isFormValid: boolean;
  errors: string[];
}

// Name validation
export function validateName(name: string): ValidationResult {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'שם האורח הוא שדה חובה' };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'שם האורח חייב להכיל לפחות 2 תווים' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'שם האורח לא יכול להכיל יותר מ-50 תווים' };
  }
  
  // Check for invalid characters (numbers, excessive special characters)
  const invalidCharsRegex = /[0-9]/;
  if (invalidCharsRegex.test(trimmedName)) {
    return { isValid: false, error: 'שם האורח לא יכול להכיל מספרים' };
  }
  
  // Check for excessive special characters (allow spaces, hyphens, apostrophes)
  const allowedCharsRegex = /^[\u0590-\u05FF\u200F\u200Ea-zA-Z\s\-'.]+$/;
  if (!allowedCharsRegex.test(trimmedName)) {
    return { isValid: false, error: 'שם האורח מכיל תווים לא חוקיים' };
  }
  
  return { isValid: true };
}

// Israeli phone number validation
export function validatePhoneNumber(phoneNumber: string): ValidationResult {
  const trimmedPhone = phoneNumber.trim();
  
  // Allow empty phone number (optional field)
  if (!trimmedPhone) {
    return { isValid: true };
  }
  
  // Remove common separators (spaces, hyphens, dots)
  const cleanPhone = trimmedPhone.replace(/[\s\-.]/g, '');
  
  // Israeli phone number patterns
  const israeliMobileRegex = /^(05[0-9]|07[0-9])\d{7}$/; // Mobile: 050-052, 054-059, 070-079
  const israeliLandlineRegex = /^0[2-4,8-9]\d{7}$/; // Landline: 02, 03, 04, 08, 09
  const israeliInternationalRegex = /^\+972(5[0-9]|7[0-9]|[2-4,8-9])\d{7}$/; // International format
  
  if (cleanPhone.startsWith('+972')) {
    if (!israeliInternationalRegex.test(cleanPhone)) {
      return { isValid: false, error: 'מספר טלפון בינלאומי לא תקין (נדרש פורמט: +972XXXXXXXX)' };
    }
  } else if (cleanPhone.startsWith('0')) {
    if (!israeliMobileRegex.test(cleanPhone) && !israeliLandlineRegex.test(cleanPhone)) {
      return { isValid: false, error: 'מספר טלפון לא תקין (נדרש פורמט: 05X-XXXXXXX או 0X-XXXXXXX)' };
    }
  } else {
    return { isValid: false, error: 'מספר טלפון חייב להתחיל ב-0 או +972' };
  }
  
  return { isValid: true };
}

// Number of guests validation
export function validateNumberOfGuests(numberOfGuests: number): ValidationResult {
  if (isNaN(numberOfGuests)) {
    return { isValid: false, error: 'מספר מוזמנים חייב להיות מספר' };
  }
  
  if (numberOfGuests < 1) {
    return { isValid: false, error: 'מספר מוזמנים חייב להיות לפחות 1' };
  }
  
  if (numberOfGuests > 20) {
    return { isValid: false, error: 'מספר מוזמנים לא יכול להיות יותר מ-20' };
  }
  
  if (!Number.isInteger(numberOfGuests)) {
    return { isValid: false, error: 'מספר מוזמנים חייב להיות מספר שלם' };
  }
  
  return { isValid: true };
}

// Notes validation (optional but with length limit)
export function validateNotes(notes: string): ValidationResult {
  const trimmedNotes = notes.trim();
  
  if (trimmedNotes.length > 500) {
    return { isValid: false, error: 'הערות לא יכולות להכיל יותר מ-500 תווים' };
  }
  
  return { isValid: true };
}

// Comprehensive form validation
export function validateGuestForm(formData: {
  name: string;
  phoneNumber: string;
  numberOfGuests: number;
  notes: string;
}): GuestFormValidation {
  const nameValidation = validateName(formData.name);
  const phoneValidation = validatePhoneNumber(formData.phoneNumber);
  const guestsValidation = validateNumberOfGuests(formData.numberOfGuests);
  const notesValidation = validateNotes(formData.notes);
  
  const errors: string[] = [];
  
  if (!nameValidation.isValid && nameValidation.error) {
    errors.push(nameValidation.error);
  }
  
  if (!phoneValidation.isValid && phoneValidation.error) {
    errors.push(phoneValidation.error);
  }
  
  if (!guestsValidation.isValid && guestsValidation.error) {
    errors.push(guestsValidation.error);
  }
  
  if (!notesValidation.isValid && notesValidation.error) {
    errors.push(notesValidation.error);
  }
  
  const isFormValid = nameValidation.isValid && 
                      phoneValidation.isValid && 
                      guestsValidation.isValid &&
                      notesValidation.isValid;
  
  return {
    name: nameValidation,
    phoneNumber: phoneValidation,
    numberOfGuests: guestsValidation,
    notes: notesValidation,
    isFormValid,
    errors
  };
}

// Format phone number for display (add hyphens)
export function formatPhoneNumber(phoneNumber: string): string {
  const cleanPhone = phoneNumber.replace(/[\s\-.]/g, '');
  
  if (cleanPhone.startsWith('+972')) {
    const numberPart = cleanPhone.substring(4);
    if (numberPart.length === 9) {
      return `+972-${numberPart.substring(0, 2)}-${numberPart.substring(2, 5)}-${numberPart.substring(5)}`;
    }
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    return `${cleanPhone.substring(0, 3)}-${cleanPhone.substring(3, 6)}-${cleanPhone.substring(6)}`;
  }
  
  return phoneNumber; // Return original if can't format
} 