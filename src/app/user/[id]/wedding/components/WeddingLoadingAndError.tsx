'use client';

import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useWeddingContext } from '../context/WeddingContext';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffe4ec 0%, #fff 60%, #ffe4ec 100%)',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  errorMessage: {
    background: 'linear-gradient(90deg, #fca5a5 0%, #fbcfe8 100%)',
    color: '#b91c1c',
    borderRadius: '999px',
    padding: '0.8rem 1.2rem',
    textAlign: 'center',
    fontWeight: 700,
    marginBottom: '1.2rem',
    fontSize: '1.1rem',
    border: '1.5px solid #fca5a5',
    boxShadow: '0 2px 8px 0 #fca5a5',
    maxWidth: '540px',
    width: '100%',
    marginTop: '2rem',
  },
  button: {
    background: 'linear-gradient(90deg, #f472b6 0%, #f9a8d4 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    padding: '0.4rem 1.2rem',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px 0 #fbcfe8',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
    marginLeft: '0.5rem',
  },
};

interface WeddingLoadingProps {
  isAuthReady: boolean;
}

interface WeddingErrorProps {
  onRetry: () => void;
}

export function WeddingLoading({ isAuthReady }: WeddingLoadingProps) {
  const { isLoading } = useWeddingContext();

  if (!isAuthReady || isLoading) {
    return (
      <div style={styles.page as React.CSSProperties}>
        <LoadingSpinner 
          text="טוען את הגדרות החתונה..." 
          size="large"
          fullScreen={false}
          color="pink"
        />
      </div>
    );
  }

  return null;
}

export function WeddingError({ onRetry }: WeddingErrorProps) {
  const { error, clearError, refreshData } = useWeddingContext();

  if (!error) {
    return null;
  }

  const handleRetry = async () => {
    clearError();
    try {
      await refreshData();
      onRetry();
    } catch (err) {
      console.error('Failed to retry:', err);
    }
  };

  return (
    <div style={styles.page as React.CSSProperties}>
      <div style={styles.errorMessage as React.CSSProperties}>
        {error}
        <button 
          style={styles.button as React.CSSProperties} 
          onClick={handleRetry}
        >
          נסה שוב
        </button>
      </div>
    </div>
  );
}

interface WeddingLoadingAndErrorProps {
  isAuthReady: boolean;
  children: React.ReactNode;
}

export default function WeddingLoadingAndError({ 
  isAuthReady, 
  children 
}: WeddingLoadingAndErrorProps) {
  const { error, isLoading, refreshData } = useWeddingContext();

  // Show loading screen
  if (!isAuthReady || isLoading) {
    return <WeddingLoading isAuthReady={isAuthReady} />;
  }

  // Show error screen
  if (error) {
    return <WeddingError onRetry={refreshData} />;
  }

  // Show children if no loading or error
  return <>{children}</>;
} 