'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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

// הגדרת סגנון גלובלי לאנימציית הספינר
const globalStyles = `
  @keyframes loaderSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loader {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: loaderSpin 0.8s linear infinite;
    display: inline-block;
    margin-right: 8px;
  }
`;

export default function ServicesPage() {
  const router = useRouter();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    errorMessage: ''
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/services/${categoryId}`);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setFormStatus({
      isSubmitting: true,
      isSuccess: false,
      isError: false,
      errorMessage: ''
    });
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'אירעה שגיאה בשליחת ההודעה');
      }
      
      // ניקוי הטופס אחרי שליחה מוצלחת
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      setFormStatus({
        isSubmitting: false,
        isSuccess: true,
        isError: false,
        errorMessage: ''
      });
      
      // סגירת הפופ-אפ אחרי 2 שניות
      setTimeout(() => {
        setIsContactModalOpen(false);
        
        // איפוס מצב ההצלחה כדי שיהיה מוכן לפעם הבאה
        setFormStatus(prev => ({
          ...prev,
          isSuccess: false
        }));
      }, 2000);
      
    } catch (error: unknown) {
      console.error('שגיאה בשליחת הטופס:', error);
      
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'אירעה שגיאה בשליחת ההודעה'
      });
    }
  };
  
  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
  };
  
  const handleCategoryLeave = () => {
    setActiveCategory(null);
  };
  
  return (
    <>
      <Navbar />
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
                border: activeCategory === category.id ? `2px solid ${category.iconColor}` : 'none',
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
            האם אתם ספקים ומעוניינים להצטרף לפלטפורמה שלנו?{' '}
            <button 
              onClick={() => setIsContactModalOpen(true)} 
              style={{
                ...styles.footerLink,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              צרו קשר
            </button>
          </p>
        </div>

        {/* הפופ-אפ - יוצג רק כאשר isContactModalOpen הוא true */}
        {isContactModalOpen && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '1rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                direction: 'rtl'
              }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div style={{
                background: 'linear-gradient(90deg, #ff4081, #ff9fb1)',
                padding: '1.5rem',
                position: 'relative'
              }}>
                <button 
                  onClick={() => setIsContactModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>צור קשר</h2>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                {formStatus.isSuccess ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px', color: '#10b981', margin: '0 auto 1rem' }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>ההודעה נשלחה בהצלחה!</h3>
                    <p style={{ color: '#4b5563' }}>תודה שפנית אלינו, ניצור איתך קשר בהקדם.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>שם מלא</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem 0.75rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem',
                          outline: 'none'
                        }}
                        placeholder="הזן את שמך המלא"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>כתובת אימייל</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem 0.75rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem',
                          outline: 'none'
                        }}
                        placeholder="הזן את כתובת האימייל שלך"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>מספר טלפון</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem 0.75rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem',
                          outline: 'none'
                        }}
                        placeholder="הזן את מספר הטלפון שלך"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>הודעה</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem 0.75rem', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '0.375rem',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                        placeholder="כתוב את הודעתך כאן..."
                      />
                    </div>
                    
                    {formStatus.isError && (
                      <div style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#fee2e2', 
                        color: '#b91c1c',
                        borderRadius: '0.375rem',
                        marginBottom: '0.5rem'
                      }}>
                        {formStatus.errorMessage}
                      </div>
                    )}
                    
                    <motion.button 
                      type="submit" 
                      style={{
                        width: '100%',
                        padding: '0.625rem 1.25rem',
                        backgroundColor: formStatus.isSubmitting ? '#f472b6' : '#ec4899',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontWeight: '500',
                        cursor: formStatus.isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      disabled={formStatus.isSubmitting}
                      whileHover={{ scale: formStatus.isSubmitting ? 1 : 1.05 }}
                      whileTap={{ scale: formStatus.isSubmitting ? 1 : 0.95 }}
                    >
                      {formStatus.isSubmitting && <div className="loader"></div>}
                      {formStatus.isSubmitting ? 'שולח...' : 'שלח הודעה'}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* הוספת סגנון גלובלי */}
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </div>
    </>
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