'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();
  
  const navigateToContact = () => {
    router.push('/#section-contact');
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>קצת עלינו...</h1>
        <div style={styles.titleDecoration}></div>
      </div>
      
      <div style={styles.content}>
        <section style={styles.section}>
          <div style={styles.sectionIcon}>
            <i className="fas fa-users"></i>
          </div>
          <div style={styles.sectionContent}>
            <h2 style={styles.subtitle}>מי אנחנו?</h2>
            <p style={styles.text}>
            ב-Wedding Planner אנחנווו מאמינים שכל סיפור אהבה ראוי לחתונה מהחלומות. לכן יצרנו עבורכם פלטפורמה שתלווה אתכם צעד אחר 
            צעד – מההצעה המרגשת ועד לריקוד הראשון. עם מגוון ספקים איכותיים, טיפים שיחסכו 
            לכם כאבי ראש וכלים שיעזרו לשמור על סדר ותקציב,
             אנחנו כאן כדי שתוכלו להתמקד בדבר הכי חשוב – האהבה שלכם.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionIcon}>
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div style={styles.sectionContent}>
            <h2 style={styles.subtitle}>השירותים שלנו</h2>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <i className="fas fa-search" style={styles.listIcon}></i>
                <span>חיפוש וסינון ספקים לפי קטגוריות</span>
              </li>
              <li style={styles.listItem}>
                <i className="fas fa-wallet" style={styles.listIcon}></i>
                <span>כלים לניהול תקציב החתונה</span>
              </li>
              <li style={styles.listItem}>
                <i className="fas fa-tasks" style={styles.listIcon}></i>
                <span>רשימת משימות אינטראקטיבית</span>
              </li>
              <li style={styles.listItem}>
                <i className="fas fa-comment-dots" style={styles.listIcon}></i>
                <span>טיפים והמלצות מזוגות אחרים</span>
              </li>
              <li style={styles.listItem}>
                <i className="fas fa-envelope-open-text" style={styles.listIcon}></i>
                <span>מערכת ניהול הזמנות דיגיטלית</span>
              </li>
            </ul>
          </div>
        </section>

        <section style={styles.section}>
          <div 
            style={{...styles.sectionIcon, cursor: 'pointer'}}
            onClick={navigateToContact}
          >
            <i className="fas fa-phone-alt"></i>
          </div>
          <div style={styles.sectionContent}>
            <h2 style={styles.subtitle}>
              <Link href="/#section-contact" style={styles.contactLink}>צרו קשר</Link>
            </h2>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <i className="fas fa-phone" style={styles.contactIcon}></i>
                <span>03-1234567</span>
              </div>
              <div style={styles.contactItem}>
                <i className="fas fa-envelope" style={styles.contactIcon}></i>
                <span>info@weddingplanner.co.il</span>
              </div>
              <div style={styles.contactItem}>
                <i className="fas fa-map-marker-alt" style={styles.contactIcon}></i>
                <span>רחוב האהבה 12, תל אביב</span>
              </div>
              <div style={styles.contactButtonContainer}>
                <button 
                  style={styles.contactButton}
                  onClick={navigateToContact}
                >
                  עבור לדף צור קשר
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={styles.footer}>
        <div style={styles.socialLinks}>
          <a href="#" style={styles.socialLink}>
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" style={styles.socialLink}>
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" style={styles.socialLink}>
            <i className="fab fa-pinterest"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '100px auto 50px',
    padding: '0 2rem',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  header: {
    padding: '3rem 0 1.5rem',
    textAlign: 'center' as const,
    position: 'relative' as const,
  },
  title: {
    fontSize: '3.5rem',
    color: '#FF4081',
    textAlign: 'center' as const,
    marginBottom: '1.2rem',
    fontFamily: 'var(--font-shrikhand), cursive',
    position: 'relative' as const,
    display: 'inline-block',
  },
  titleDecoration: {
    width: '80px',
    height: '4px',
    background: 'linear-gradient(90deg, #ff4081, #ff9fb1)',
    margin: '0 auto 3rem',
    borderRadius: '2px',
  },
  content: {
    padding: '1rem 2rem 3rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3rem',
  },
  section: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
    backgroundColor: '#fbf7f3',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.03)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.06)'
    }
  },
  sectionIcon: {
    minWidth: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#ff4081',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2rem',
    boxShadow: '0 6px 15px rgba(255, 64, 129, 0.25)',
  },
  sectionContent: {
    flex: 1,
  },
  subtitle: {
    fontSize: '2.2rem',
    color: '#444',
    marginBottom: '1.5rem',
    fontWeight: '600',
  },
  contactLink: {
    color: '#444',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    ':hover': {
      color: '#ff4081',
    }
  },
  text: {
    fontSize: '1.2rem',
    lineHeight: '1.8',
    color: '#666',
  },
  list: {
    fontSize: '1.2rem',
    lineHeight: '1.8',
    color: '#666',
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    transition: 'transform 0.2s ease',
    ':hover': {
      transform: 'translateX(-5px)'
    }
  },
  listIcon: {
    color: '#ff4081',
    marginLeft: '1rem',
    fontSize: '1.2rem',
    width: '25px',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.2rem',
  },
  contactIcon: {
    color: '#ff4081',
    marginLeft: '1rem',
    fontSize: '1.2rem',
    width: '25px',
  },
  contactButtonContainer: {
    marginTop: '1.5rem',
  },
  contactButton: {
    backgroundColor: '#ff4081',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(255, 64, 129, 0.3)',
    ':hover': {
      backgroundColor: '#e0336d',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 15px rgba(255, 64, 129, 0.4)',
    }
  },
  footer: {
    backgroundColor: '#f9f4f0',
    padding: '2rem',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    borderTop: '1px solid rgba(0,0,0,0.05)',
  },
  socialLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  socialLink: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#ff4081',
    fontSize: '1.2rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    ':hover': {
      backgroundColor: '#ff4081',
      color: 'white',
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 15px rgba(255, 64, 129, 0.2)',
    }
  },
}; 