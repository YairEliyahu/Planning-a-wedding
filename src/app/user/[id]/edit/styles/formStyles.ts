import { CSSProperties } from 'react';

interface Styles {
  container: CSSProperties;
  content: CSSProperties;
  title: CSSProperties;
  form: CSSProperties;
  gridContainer: CSSProperties;
  section: CSSProperties;
  sectionTitle: CSSProperties;
  fieldContainer: CSSProperties;
  label: CSSProperties;
  input: CSSProperties;
  successMessage: CSSProperties;
  errorMessage: CSSProperties;
  profileImageContainer: CSSProperties;
  profileImage: CSSProperties;
  button: CSSProperties;
  buttonHover: CSSProperties;
  preferencesSection: CSSProperties;
  preferencesGrid: CSSProperties;
  checkboxLabel: CSSProperties;
  checkbox: CSSProperties;
  checkboxText: CSSProperties;
  inviteMessage: CSSProperties;
  inviteMessageSuccess: CSSProperties;
  loadingSpinner: CSSProperties;
  partnerEmailContainer: CSSProperties;
  partnerEmailWrapper: CSSProperties;
}

export const styles: Styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffe4ec 0%, #fff 60%, #ffe4ec 100%)',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  content: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: '2rem',
    boxShadow: '0 8px 32px 0 rgba(245, 158, 158, 0.12)',
    border: '1.5px solid #fbcfe8',
    padding: '2.5rem 2rem',
    marginTop: '3rem',
    maxWidth: '540px',
    width: '100%',
    position: 'relative',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
  },
  section: {
    background: 'rgba(255,245,248,0.7)',
    borderRadius: '1.5rem',
    padding: '1.5rem 1rem',
    boxShadow: '0 2px 8px 0 #fbcfe8',
    border: '1px solid #fbcfe8',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#be185d',
    marginBottom: '1.2rem',
    letterSpacing: '0.01em',
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.2rem',
  },
  label: {
    fontWeight: 500,
    color: '#be185d',
    fontSize: '1rem',
    marginBottom: '0.2rem',
  },
  input: {
    border: '1.5px solid #fbcfe8',
    borderRadius: '999px',
    padding: '0.7rem 1.2rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#fff',
    color: '#be185d',
    fontWeight: 500,
    boxShadow: '0 1px 4px 0 #fbcfe8',
  },
  successMessage: {
    background: 'linear-gradient(90deg, #f9a8d4 0%, #fbcfe8 100%)',
    color: '#be185d',
    borderRadius: '999px',
    padding: '0.8rem 1.2rem',
    textAlign: 'center',
    fontWeight: 700,
    marginBottom: '1.2rem',
    fontSize: '1.1rem',
    border: '1.5px solid #fbcfe8',
    boxShadow: '0 2px 8px 0 #fbcfe8',
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
  },
  profileImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  profileImage: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    border: '3px solid #f472b6',
    objectFit: 'cover',
    boxShadow: '0 2px 8px 0 #fbcfe8',
  },
  button: {
    background: 'linear-gradient(90deg, #f472b6 0%, #f9a8d4 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    padding: '0.9rem 2.2rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px 0 #fbcfe8',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  buttonHover: {
    background: 'linear-gradient(90deg, #f472b6 0%, #be185d 100%)',
    boxShadow: '0 4px 16px 0 #fbcfe8',
    transform: 'scale(1.04)',
  },
  preferencesSection: {
    marginTop: '2rem',
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
  },
  preferencesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  checkboxText: {
    fontSize: '0.9rem',
    color: '#666',
  },
  inviteMessage: {
    fontSize: '0.8rem',
    color: '#FF8C00',
    marginTop: '0.5rem',
  },
  inviteMessageSuccess: {
    fontSize: '0.8rem',
    color: '#388E3C',
    marginTop: '0.5rem',
  },
  loadingSpinner: {
    textAlign: 'center',
    padding: '2rem',
  },
  partnerEmailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.2rem',
  },
  partnerEmailWrapper: {
    display: 'flex',
    alignItems: 'stretch',
  },
}; 