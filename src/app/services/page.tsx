'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// מידע על קטגוריות הספקים
const serviceCategories = [
  {
    id: 'venues',
    title: 'אולמות ומקומות אירוח',
    description: 'מבחר אולמות וגני אירועים מהיפים בארץ',
    icon: 'fas fa-map-marker-alt',
    bgColor: '#ffebee',
    iconColor: '#e53935'
  },
  {
    id: 'photographers',
    title: 'צלמים וצילום',
    description: 'צלמי סטילס, וידאו ודרונים לתיעוד היום המיוחד',
    icon: 'fas fa-camera',
    bgColor: '#e8f5e9',
    iconColor: '#43a047'
  },
  {
    id: 'catering',
    title: 'קייטרינג והסעדה',
    description: 'שפים ושירותי קייטרינג איכותיים',
    icon: 'fas fa-utensils',
    bgColor: '#fff3e0',
    iconColor: '#fb8c00'
  },
  {
    id: 'music',
    title: 'תקליטנים והופעות',
    description: 'תקליטנים, להקות ואמנים להופעה בחתונה',
    icon: 'fas fa-music',
    bgColor: '#e3f2fd',
    iconColor: '#1e88e5'
  },
  {
    id: 'dresses',
    title: 'שמלות ואופנה',
    description: 'מעצבי שמלות כלה, חליפות חתן ואביזרים',
    icon: 'fas fa-female',
    bgColor: '#f3e5f5',
    iconColor: '#8e24aa'
  },
  {
    id: 'jewelry',
    title: 'תכשיטים וטבעות',
    description: 'טבעות אירוסין, תכשיטים ואקססוריז לכלה',
    icon: 'fas fa-ring',
    bgColor: '#fffde7',
    iconColor: '#fdd835'
  },
  {
    id: 'flowers',
    title: 'פרחים ועיצוב',
    description: 'עיצוב פרחוני, סידורי שולחן ודקורציה',
    icon: 'fas fa-leaf',
    bgColor: '#e0f7fa',
    iconColor: '#00acc1'
  },
  {
    id: 'makeup',
    title: 'איפור ושיער',
    description: 'מאפרים ומעצבי שיער ליום החתונה',
    icon: 'fas fa-magic',
    bgColor: '#fce4ec',
    iconColor: '#d81b60'
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
  };
  
  const handleCategoryLeave = () => {
    setActiveCategory(null);
  };
  
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/services/${categoryId}`);
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ספקי חתונות</h1>
        <div style={styles.titleDecoration}></div>
        <p style={styles.headerText}>
          בחרו מתוך מגוון ספקים איכותיים שיהפכו את החתונה שלכם למושלמת
        </p>
      </div>
      
      <div style={styles.categoriesGrid}>
        {serviceCategories.map((category) => (
          <motion.div 
            key={category.id}
            style={{
              ...styles.categoryCard,
              backgroundColor: category.bgColor,
            }}
            whileHover={{ 
              y: -10,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onHoverStart={() => handleCategoryHover(category.id)}
            onHoverEnd={handleCategoryLeave}
          >
            <Link href={`/services/${category.id}`} style={styles.categoryLink}>
              <div 
                style={{
                  ...styles.categoryIcon,
                  color: category.iconColor,
                  border: `2px solid ${category.iconColor}`
                }}
              >
                <i className={category.icon}></i>
              </div>
              <h3 style={styles.categoryTitle}>{category.title}</h3>
              <p style={styles.categoryDescription}>{category.description}</p>
            </Link>
            <button 
              style={{
                ...styles.categoryButton,
                backgroundColor: category.iconColor,
              }}
              onClick={() => handleCategoryClick(category.id)}
            >
              לצפייה בספקים
            </button>
          </motion.div>
        ))}
      </div>
      
      <div style={styles.footer}>
        <p style={styles.footerText}>
          האם אתם ספקים ומעוניינים להצטרף לפלטפורמה שלנו? <a href="/#section-contact" style={styles.footerLink}>צרו קשר</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '100px auto 50px',
    padding: '0 2rem',
  },
  header: {
    padding: '2rem 0 3rem',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '3.5rem',
    color: '#333',
    marginBottom: '1rem',
    fontFamily: 'var(--font-shrikhand), cursive',
  },
  titleDecoration: {
    width: '80px',
    height: '4px',
    background: 'linear-gradient(90deg, #ff4081, #ff9fb1)',
    margin: '0 auto 1.5rem',
    borderRadius: '2px',
  },
  headerText: {
    fontSize: '1.2rem',
    maxWidth: '700px',
    margin: '0 auto',
    color: '#666',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '2rem',
    padding: '1rem 0 3rem',
  },
  categoryCard: {
    borderRadius: '12px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  categoryLink: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
  },
  categoryIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    marginBottom: '1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  categoryTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.8rem',
    color: '#333',
  },
  categoryDescription: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  categoryButton: {
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: 'auto',
    ':hover': {
      transform: 'translateY(-2px)',
      opacity: 0.9,
    }
  },
  footer: {
    borderTop: '1px solid #eee',
    padding: '2rem 0',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '1.1rem',
    color: '#667',
  },
  footerLink: {
    color: '#ff4081',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease',
    ':hover': {
      color: '#e0336d',
    }
  }
}; 