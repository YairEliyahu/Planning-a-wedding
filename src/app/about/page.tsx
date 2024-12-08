export default function AboutPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>אודות Wedding Planner</h1>
      
      <section style={styles.section}>
        <h2 style={styles.subtitle}>מי אנחנו?</h2>
        <p style={styles.text}>
          Wedding Planner הוא הפלטפורמה המובילה לתכנון חתונות בישראל. 
          אנחנו מחברים בין זוגות מאורסים לבין ספקי חתונות מקצועיים, 
          ומספקים כלים וטיפים לתכנון החתונה המושלמת.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>השירותים שלנו</h2>
        <ul style={styles.list}>
          <li>חיפוש וסינון ספקים לפי קטגוריות</li>
          <li>כלים לניהול תקציב החתונה</li>
          <li>רשימת משימות אינטראקטיבית</li>
          <li>טיפים והמלצות מזוגות אחרים</li>
          <li>מערכת ניהול הזמנות דיגיטלית</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>צרו קשר</h2>
        <p style={styles.text}>
          יש לכם שאלות? נשמח לעזור!<br />
          טלפון: 03-1234567<br />
          אימייל: info@weddingplanner.co.il
        </p>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '80px auto 0',
    padding: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    color: '#333',
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  section: {
    marginBottom: '2rem',
  },
  subtitle: {
    fontSize: '1.8rem',
    color: '#444',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: '#666',
  },
  list: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#666',
    paddingRight: '1.5rem',
  },
}; 