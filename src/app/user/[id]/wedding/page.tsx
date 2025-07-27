'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import QueryProvider from './providers/QueryProvider';
import WeddingProvider, { useWeddingContext } from './context/WeddingContext';
import WeddingPreferencesForm from './components/WeddingPreferencesForm';
import WeddingPreferencesSummary from './components/WeddingPreferencesSummary';
import WeddingLoadingAndError from './components/WeddingLoadingAndError';

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
  card: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px 0 rgba(245, 158, 158, 0.12)',
    border: '1.5px solid #fbcfe8',
    padding: '2.5rem 2rem',
    marginTop: '2rem',
    maxWidth: '540px',
    width: '100%',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 800,
    marginBottom: '2rem',
    background: 'linear-gradient(90deg, #f472b6 0%, #f9a8d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center',
    letterSpacing: '0.02em',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#be185d',
    marginBottom: '1.2rem',
    letterSpacing: '0.01em',
    textAlign: 'center',
  },
};

interface WeddingPageContentProps {
  userId: string;
}

function WeddingPageContent({ userId: _userId }: WeddingPageContentProps) {
  const { isAuthReady } = useAuth();
  const { profile } = useWeddingContext();

  const getWeddingTitle = () => {
    if (!profile) return 'החתונה שלכם';
    return `החתונה של ${profile.fullName} ו${profile.partnerName}`;
  };

  return (
    <WeddingLoadingAndError 
      isAuthReady={isAuthReady}
    >
      <div style={styles.page as React.CSSProperties}>
        <Navbar />
        <main style={{
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '2rem 0'
        }}>
          <div style={styles.card as React.CSSProperties}>
            <h1 style={styles.title as React.CSSProperties}>
              {getWeddingTitle()}
            </h1>
            
            {/* Wedding Preferences Summary */}
            <WeddingPreferencesSummary />

            {/* Wedding Preferences Form */}
            <div>
              <h2 style={styles.sectionTitle as React.CSSProperties}>
                העדפות חתונה
              </h2>
              <WeddingPreferencesForm />
            </div>
          </div>
        </main>
      </div>
    </WeddingLoadingAndError>
  );
}

interface MyWeddingPageProps {
  params: { id: string };
}

export default function MyWeddingPage({ params }: MyWeddingPageProps) {
  return (
    <QueryProvider>
      <WeddingProvider userId={params.id}>
        <WeddingPageContent userId={params.id} />
      </WeddingProvider>
    </QueryProvider>
  );
} 