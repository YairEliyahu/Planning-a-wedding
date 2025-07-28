'use client';

import { useState, useEffect } from 'react';
import { useGuests, NewGuest } from '../context/GuestContext';
import toast from 'react-hot-toast';
import { 
  validateGuestForm,
  formatPhoneNumber
} from '../utils/validation';

interface AddGuestFormProps {
  isVisible: boolean;
  onClose: () => void;
  hasExistingGuests: boolean;
}

interface ValidationErrors {
  name?: string;
  phoneNumber?: string;
  numberOfGuests?: string;
  notes?: string;
}

export function AddGuestForm({ isVisible, onClose, hasExistingGuests }: AddGuestFormProps) {
  const { addGuest } = useGuests();
  
  const [newGuest, setNewGuest] = useState<NewGuest>({
    name: '',
    phoneNumber: '',
    numberOfGuests: 1,
    side: 'משותף',
    isConfirmed: null,
    notes: '',
    group: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState(false);

  // Real-time validation
  useEffect(() => {
    if (showValidation) {
      const validation = validateGuestForm({
        name: newGuest.name,
        phoneNumber: newGuest.phoneNumber || '',
        numberOfGuests: newGuest.numberOfGuests,
        notes: newGuest.notes || ''
      });

      setValidationErrors({
        name: validation.name.isValid ? undefined : validation.name.error,
        phoneNumber: validation.phoneNumber.isValid ? undefined : validation.phoneNumber.error,
        numberOfGuests: validation.numberOfGuests.isValid ? undefined : validation.numberOfGuests.error,
        notes: validation.notes.isValid ? undefined : validation.notes.error
      });
    }
  }, [newGuest, showValidation]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setShowValidation(true);

    // Validate form
    const validation = validateGuestForm({
      name: newGuest.name,
      phoneNumber: newGuest.phoneNumber || '',
      numberOfGuests: newGuest.numberOfGuests,
      notes: newGuest.notes || ''
    });

    if (!validation.isFormValid) {
      // Show all validation errors
      validation.errors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format phone number before saving
      const guestToAdd = {
        ...newGuest,
        phoneNumber: newGuest.phoneNumber ? formatPhoneNumber(newGuest.phoneNumber) : ''
      };
      
      await addGuest(guestToAdd);
      
      // Reset form
      setNewGuest({
        name: '',
        phoneNumber: '',
        numberOfGuests: 1,
        side: 'משותף',
        isConfirmed: null,
        notes: '',
        group: ''
      });
      
      setValidationErrors({});
      setShowValidation(false);
      
      toast.success(`✅ ${newGuest.name} נוסף בהצלחה לרשימת האורחים`);
      onClose();
      
    } catch (error) {
      console.error('Error adding guest:', error);
      toast.error('❌ שגיאה בהוספת אורח. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewGuest({
      name: '',
      phoneNumber: '',
      numberOfGuests: 1,
      side: 'משותף',
      isConfirmed: null,
      notes: '',
      group: ''
    });
    setValidationErrors({});
    setShowValidation(false);
    onClose();
  };

  // Field validation handlers
  const handleNameChange = (value: string) => {
    setNewGuest({...newGuest, name: value});
  };

  const handlePhoneChange = (value: string) => {
    setNewGuest({...newGuest, phoneNumber: value});
  };

  const handleNumberChange = (value: string) => {
    const num = parseInt(value) || 1;
    setNewGuest({...newGuest, numberOfGuests: num});
  };

  const handleNotesChange = (value: string) => {
    setNewGuest({...newGuest, notes: value});
  };

  // Get input field styles based on validation
  const getInputStyles = (fieldName: keyof ValidationErrors, baseStyles: string) => {
    const hasError = showValidation && validationErrors[fieldName];
    const errorStyles = hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500';
    return `${baseStyles} ${errorStyles}`;
  };

  // Error message component
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="text-red-500 text-xs mt-1 flex items-center">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    );
  };

  if (!isVisible) return null;

  // Form validation state
  const validation = validateGuestForm({
    name: newGuest.name,
    phoneNumber: newGuest.phoneNumber || '',
    numberOfGuests: newGuest.numberOfGuests,
    notes: newGuest.notes || ''
  });

  // Form for when there are no existing guests - table-style layout
  if (!hasExistingGuests) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-bold text-gray-800">הוספת אורח ראשון</h3>
        </div>
        
        {/* Table headers */}
        <div className="bg-gray-100 px-6 py-3">
          <div className="grid grid-cols-8 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="text-right">שם אורח *</div>
            <div className="text-right">טלפון</div>
            <div className="text-center">מספר מוזמנים</div>
            <div className="text-center">צד</div>
            <div className="text-center">קבוצה</div>
            <div className="text-center">סטטוס</div>
            <div className="text-right">הערות</div>
            <div className="text-center">פעולות</div>
          </div>
        </div>
        
        {/* Form fields in table layout */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-8 gap-4 items-start">
            <div>
              <input
                type="text"
                value={newGuest.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="שם האורח"
                className={getInputStyles('name', 'w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm')}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                onBlur={() => setShowValidation(true)}
              />
              <ErrorMessage error={validationErrors.name} />
            </div>
            <div>
              <input
                type="text"
                value={newGuest.phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="050-1234567"
                className={getInputStyles('phoneNumber', 'w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm')}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                onBlur={() => setShowValidation(true)}
              />
              <ErrorMessage error={validationErrors.phoneNumber} />
            </div>
            <div className="text-center">
              <input
                type="number"
                min="1"
                max="20"
                value={newGuest.numberOfGuests}
                onChange={(e) => handleNumberChange(e.target.value)}
                className={getInputStyles('numberOfGuests', 'w-16 mx-auto p-2 border rounded text-center focus:outline-none focus:ring-2 text-sm')}
                onBlur={() => setShowValidation(true)}
              />
              <ErrorMessage error={validationErrors.numberOfGuests} />
            </div>
            <div className="text-center">
              <select
                value={newGuest.side}
                onChange={(e) => setNewGuest({...newGuest, side: e.target.value as 'חתן' | 'כלה' | 'משותף'})}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="חתן">חתן</option>
                <option value="כלה">כלה</option>
                <option value="משותף">משותף</option>
              </select>
            </div>
            <div className="text-center">
              <select
                value={newGuest.group || ''}
                onChange={(e) => setNewGuest({...newGuest, group: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">בחר קבוצה</option>
                <option value="משפחה">משפחה</option>
                <option value="עבודה">עבודה</option>
                <option value="חברים">חברים</option>
                <option value="צבא">צבא</option>
                <option value="לימודים">לימודים</option>
                <option value="שכונה">שכונה</option>
              </select>
            </div>
            <div className="text-center">
              <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                ממתין
              </span>
            </div>
            <div>
              <input
                type="text"
                value={newGuest.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="הערות נוספות"
                className={getInputStyles('notes', 'w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm')}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                onBlur={() => setShowValidation(true)}
              />
              <ErrorMessage error={validationErrors.notes} />
            </div>
            <div className="text-center">
              <div className="flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!validation.isFormValid || isSubmitting}
                  className={`p-2 rounded-full ${
                   !validation.isFormValid || isSubmitting
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                     : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  } text-sm transition-colors flex items-center justify-center`}
                  title="הוסף אורח"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-600 text-sm transition-colors flex items-center justify-center disabled:opacity-50"
                  title="ביטול"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form for when there are existing guests - modal style
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">הוספת אורח חדש</h3>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700 p-1 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">
              שם האורח <span className="text-red-500">*</span>
            </label>
            <input
              id="guest-name"
              type="text"
              value={newGuest.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="הזן שם האורח"
              className={getInputStyles('name', 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2')}
              required
              disabled={isSubmitting}
              onBlur={() => setShowValidation(true)}
            />
            <ErrorMessage error={validationErrors.name} />
          </div>
          
          <div>
            <label htmlFor="guest-phone" className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון</label>
            <input
              id="guest-phone"
              type="text"
              value={newGuest.phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="050-1234567"
              className={getInputStyles('phoneNumber', 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2')}
              disabled={isSubmitting}
              onBlur={() => setShowValidation(true)}
            />
            <ErrorMessage error={validationErrors.phoneNumber} />
          </div>
          
          <div>
            <label htmlFor="guest-count" className="block text-sm font-medium text-gray-700 mb-1">מספר מוזמנים</label>
            <input
              id="guest-count"
              type="number"
              min="1"
              max="20"
              value={newGuest.numberOfGuests}
              onChange={(e) => handleNumberChange(e.target.value)}
              className={getInputStyles('numberOfGuests', 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2')}
              disabled={isSubmitting}
              onBlur={() => setShowValidation(true)}
            />
            <ErrorMessage error={validationErrors.numberOfGuests} />
          </div>
          
          <div>
            <label htmlFor="guest-side" className="block text-sm font-medium text-gray-700 mb-1">צד</label>
            <select
              id="guest-side"
              value={newGuest.side}
              onChange={(e) => setNewGuest({...newGuest, side: e.target.value as 'חתן' | 'כלה' | 'משותף'})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="חתן">חתן</option>
              <option value="כלה">כלה</option>
              <option value="משותף">משותף</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="guest-group" className="block text-sm font-medium text-gray-700 mb-1">קבוצה</label>
            <select
              id="guest-group"
              value={newGuest.group || ''}
              onChange={(e) => setNewGuest({...newGuest, group: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">בחר קבוצה (אופציונלי)</option>
              <option value="משפחה">משפחה</option>
              <option value="עבודה">עבודה</option>
              <option value="חברים">חברים</option>
              <option value="צבא">צבא</option>
              <option value="לימודים">לימודים</option>
              <option value="שכונה">שכונה</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="guest-notes" className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
            <textarea
              id="guest-notes"
              value={newGuest.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="הערות נוספות (אופציונלי)"
              rows={3}
              className={getInputStyles('notes', 'w-full p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none')}
              disabled={isSubmitting}
              onBlur={() => setShowValidation(true)}
            />
            <ErrorMessage error={validationErrors.notes} />
            <div className="text-xs text-gray-500 mt-1">
              {(newGuest.notes || '').length}/500 תווים
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!validation.isFormValid || isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                !validation.isFormValid || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  מוסיף...
                </div>
              ) : (
                'הוסף אורח'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 