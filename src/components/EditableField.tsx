'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface EditableFieldProps {
  label: string;
  value: string | number;
  type?: 'text' | 'number';
  onSave: (value: string) => void;
  fieldName: string;
}

export default function EditableField({ label, value, type = 'text', onSave ,fieldName}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value.toString());
  const [isLoading, setIsLoading] = useState(false);
  const { updateUserData } = useAuth();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(currentValue);
      
      if (fieldName === 'fullName') {
        updateUserData({ fullName: currentValue });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <span style={styles.label}>{label}</span>
      
      {isEditing ? (
        <div style={styles.editContainer}>
          <input
            type={type}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            style={styles.input}
            disabled={isLoading}
          />
          <div style={styles.buttonGroup}>
            <button
              onClick={handleSave}
              style={{ ...styles.button, ...styles.saveButton }}
              disabled={isLoading}
            >
              {isLoading ? '...' : 'שמור'}
            </button>
            <button
              onClick={() => {
                setCurrentValue(value.toString());
                setIsEditing(false);
              }}
              style={{ ...styles.button, ...styles.cancelButton }}
              disabled={isLoading}
            >
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.displayContainer}>
          <span style={styles.value}>{value}</span>
          <button
            onClick={() => setIsEditing(true)}
            style={styles.editButton}
          >
            ערוך
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },
  editContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  displayContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: '1.1rem',
    color: '#333',
  },
  editButton: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#0070f3',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
}; 