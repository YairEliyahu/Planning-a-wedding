'use client';
import './globals.css';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Image from 'next/image';

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  heroSection: {
    position: 'relative' as const,
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainImage: {
    width: 'auto',
    height: '100%',
    objectFit: 'contain' as const,
    maxWidth: 'none',
  },
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 2,
    textAlign: 'center' as const,
    color: '#ffffff',
    padding: '2rem',
    maxWidth: '800px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    position : 'relative',
    top : '50%',
    left : '50%',
    transform : 'translate(-50%, -50%)',
  },
  subtitle: {
    fontSize: '1.3rem',
    marginBottom: '2rem',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    position : 'relative',
    top : '-40px',
    left : '50%',
    transform : 'translate(-50%, -50%)',
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
    position : 'relative',
    top : '50px',
  },
  primaryButton: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '2px solid #ffffff',
  },
  additionalContent: {
    backgroundColor: '#f5f5f5',
    padding: '4rem 2rem',
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    color: '#333',
    textAlign: 'center' as const,
    marginBottom: '3rem',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    padding: '0 1rem',
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
};

export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* אזור התמונה המרכזית */}
      <div style={styles.heroSection}>
        <div style={styles.imageWrapper}>
          <Image
            src="/images/wedding-background.jpg"
            alt="Wedding background"
            width={1920}
            height={1080}
            priority
            style={styles.mainImage}
          />
          <div style={styles.overlay} />
        </div>

        {/* תוכן ראשי מעל התמונה */}
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Wedding Planner
          </h1>
          <p style={styles.subtitle}>
            הדרך הקלה לתכנן את החתונה המושלמת
          </p>
          <div style={styles.ctaButtons}>
            <Link href="/register" style={styles.primaryButton}>
              התחל לתכנן
            </Link>
            <Link href="/about" style={styles.secondaryButton}>
              למד עוד
            </Link>
          </div>
        </div>
      </div>

      {/* תוכן נוסף מתחת לתמונה */}
      <div style={styles.additionalContent}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>השירותים שלנו</h2>
          <div style={styles.servicesGrid}>
            <div style={styles.serviceCard}>
              <h3>תכנון אירועים</h3>
              <p>ניהול מקיף של כל פרטי החתונה</p>
            </div>
            <div style={styles.serviceCard}>
              <h3>ספקים מומלצים</h3>
              <p>רשימת ספקים מובחרת ומומלצת</p>
            </div>
            <div style={styles.serviceCard}>
              <h3>ניהול תקציב</h3>
              <p>כלים לניהול וחישוב התקציב</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
