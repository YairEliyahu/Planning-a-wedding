'use client';
import './globals.css';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';


const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f9f4f0',
    overflow: 'hidden',
  },
  heroSection: {
    position: 'relative' as const,
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fbf7f3',
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
  backgroundSlider: {
    position: 'absolute' as const,
    width: '440%',
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    gap: '2px',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    flexShrink: 0,
    objectFit: 'contain' as const,
    objectPosition: 'center center' as const,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(251, 247, 243, 0.2)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 2,
    textAlign: 'center' as const,
    color: '#ffffff',
    padding: '2rem',
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '1rem',
  },
  mainTitle: {
    fontSize: '7rem',
    fontWeight: 'bold',
    marginBottom: '0.1rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    fontFamily: 'var(--font-playfair), cursive',
    color: '#ffffff',
    lineHeight: '1.6',
  },
  secondaryTitle: {
    fontSize: '5rem',
    fontWeight: 'bold', 
    marginBottom: '0.1rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    fontFamily: 'var(--font-playfair), cursive',
    color: '#ffffffdd',
    lineHeight: '1.6',
  },
  tertiaryTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    fontFamily: 'var(--font-playfair), cursive',
    color: '#ffffffbb',
    lineHeight: '1.6',  
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '2.5rem',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
    fontWeight: '500',
    maxWidth: '600px',
  },
  ctaButtons: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#ff4081',
    color: '#ffffff',
    padding: '1rem 2.5rem',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    boxShadow: '0 4px 10px rgba(255, 64, 129, 0.3)',
    display: 'inline-block',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    padding: '1rem 2.5rem',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '2px solid #ffffff',
    display: 'inline-block',
  },
  additionalContent: {
    backgroundColor: '#f9f4f0',
    padding: '4rem 2rem',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '3.5rem',
    color: '#333',
    textAlign: 'center' as const,
    marginBottom: '3rem',
    fontFamily: 'var(--font-shrikhand), cursive',
    position: 'relative' as const,
    display: 'inline-block',
    padding: '0 0.5rem',
  },
  sectionTitleDecorator: {
    content: '""',
    position: 'absolute' as const,
    bottom: '-15px',
    left: '50%',
    transform: 'translateX(-50%)' as const,
    width: '80px',
    height: '4px',
    background: 'linear-gradient(90deg, #ff4081, #ff9fb1)',
    borderRadius: '2px',
  },
  servicesSection: {
    background: 'linear-gradient(to bottom, #f9f4f0, #fff5f8)',
    padding: '7rem 2rem 5rem',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  servicesHero: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'radial-gradient(circle at top right, rgba(255, 64, 129, 0.1) 0%, transparent 70%), radial-gradient(circle at bottom left, rgba(255, 159, 177, 0.1) 0%, transparent 70%)',
    zIndex: 0,
  },
  servicesContent: {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto',
  },
  servicesGrid: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    gap: '2.5rem',
    width: '100%',
    margin: '2rem auto 0',
    overflow: 'visible',
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    padding: '3rem 2rem',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    textAlign: 'center' as const,
    flex: '1',
    width: 'calc(33.33% - 1.6rem)',
    maxWidth: 'none',
    transition: 'all 0.4s ease',
    border: '1px solid rgba(255, 64, 129, 0.1)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  serviceCardIcon: {
    fontSize: '3rem',
    color: '#ff4081',
    marginBottom: '1.5rem',
    display: 'inline-block',
  },
  serviceCardTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: '1rem',
  },
  serviceCardDesc: {
    fontSize: '1.1rem',
    color: '#666',
    lineHeight: '1.6',
  },
  contactSection: {
    backgroundColor: '#f6f1ec',
    padding: '4rem 2rem',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  contactForm: {
    width: '90vw',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  formTextarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    minHeight: '150px',
    resize: 'vertical' as const,
  },
  submitButton: {
    backgroundColor: '#ff4081',
    color: '#ffffff',
    padding: '1rem 2rem',
    borderRadius: '50px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(255, 64, 129, 0.3)',
    width: '100%',
  },
  paginationDots: {
    position: 'fixed' as const,
    right: '2rem',
    top: '50%',
    transform: 'translateY(-50%)' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    zIndex: 100,
    padding: '10px',
    borderRadius: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(5px)',
  },
  paginationDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 64, 129, 0.3)',
  },
  activeDot: {
    backgroundColor: '#ff4081',
    transform: 'scale(1.3)',
    boxShadow: '0 0 8px rgba(255, 64, 129, 0.5)',
  },
  sectionContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
};

export default function HomePage() {
  const { login, user } = useAuth();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  
  // הוספת state לטופס יצירת קשר
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
  
  // רפרנסים לחלקי העמוד
  const heroSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // תמונות רקע
  const backgroundImages = [
    '/images/wedding-background.jpg',
    '/images/311691308_10223945859767494_4494901931895656765_n.jpg',
    '/images/430853596_10226981026324761_6445618788012733513_n.jpg',
    '/images/475104690_10229871826952970_7379256486698947066_n.jpg',
    '/images/475280938_10229871827872993_8154661980827464805_n.jpg',
  ];

  // אנימציות לכיתוב מדורג
  const firstTitleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: 'easeOut' 
      }
    }
  };

  const secondTitleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: 'easeOut',
        delay: 0.5
      }
    }
  };

  const thirdTitleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: 'easeOut',
        delay: 1.0
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        delay: 1.5
      }
    }
  };

  // אנימציות לכפתורים
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 2.0 }
    },
    hover: { 
      scale: 1.05,
      boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3 }
    }
  };

  // אנימציה לסרגל התמונות
  const sliderVariants = {
    animate: {
      x: ['0%', '-80%'], // אנימציה מבוססת אחוזים במקום פיקסלים
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop' as const,
          duration: 25, // זמן קצר יותר לאנימציה חלקה
          ease: 'linear',
          repeatDelay: 0 // אין השהייה בין חזרות
        }
      }
    }
  };

  // אנימציות לכרטיסיות
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -50 },
    show: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.5, 
        ease: 'easeOut' 
      } 
    }
  };


  // ערבוב התמונות בסדר רנדומלי בכל טעינה
  useEffect(() => {
    // פונקציה לערבוב מערך
    const shuffleArray = (array: string[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    // ערבוב התמונות בכל טעינה
    setShuffledImages(shuffleArray(backgroundImages));
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = searchParams?.get('token');
        const userJson = searchParams?.get('user');
        
        if (token && userJson) {
          const userData = JSON.parse(userJson);
          await login(token, userData);
          
          // ניקוי פרמטרים מה-URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          newUrl.searchParams.delete('user');
          window.history.replaceState({}, '', newUrl.toString());
        }
      } catch (error) {
        console.error('Error processing user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [searchParams, login]);

  // מעבר בין חלקי העמוד עם גלילה
  const handleScroll = (e: WheelEvent) => {
    e.preventDefault();
    
    // מניעת טריגר כפול
    if (isScrolling.current) return;
    isScrolling.current = true;
    
    setTimeout(() => {
      isScrolling.current = false;
    }, 800); // זמן קצר יותר לאפקט חלק
    
    if (e.deltaY > 0) {
      // גלילה למטה
      if (activeSection < 2) {
        setActiveSection(prev => prev + 1);
      }
    } else {
      // גלילה למעלה
      if (activeSection > 0) {
        setActiveSection(prev => prev - 1);
      }
    }
  };

  // גלילה למיקום ספציפי על פי לחיצת קישור
  const scrollToSection = (sectionId: number) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    
    setTimeout(() => {
      isScrolling.current = false;
    }, 800);
    
    setActiveSection(sectionId);
  };

  // טיפול באירועי מגע
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (isScrolling.current) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchStartY.current - touchY;
    
    if (Math.abs(diff) < 50) return;
    
    e.preventDefault();
    isScrolling.current = true;
    
    setTimeout(() => {
      isScrolling.current = false;
    }, 800);
    
    if (diff > 0 && activeSection < 2) {
      // גלילה למטה
      setActiveSection(prev => prev + 1);
    } else if (diff < 0 && activeSection > 0) {
      // גלילה למעלה
      setActiveSection(prev => prev - 1);
    }
  };

  // אירוע גלילה
  useEffect(() => {
    window.addEventListener('wheel', handleScroll as unknown as EventListener, { passive: false });
    window.addEventListener('touchstart', handleTouchStart as unknown as EventListener);
    window.addEventListener('touchmove', handleTouchMove as unknown as EventListener, { passive: false });
    
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('wheel', handleScroll as unknown as EventListener);
      window.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
      window.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
      document.body.style.overflow = 'auto';
    };
  }, [activeSection]);

  // בדיקה אם יש ניווט דרך האש בעת העלאת הדף
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#contact-section' || hash === '#section-contact') {
        setActiveSection(2);
      } else if (hash === '#about-section' || hash === '#section-services') {
        setActiveSection(1);
      } else if (hash === '#' || hash === '#section-home' || hash === '') {
        setActiveSection(0);
      }
    }
  }, []);

  // האזנה לאירוע ניווט מותאם אישית מה-Navbar
  useEffect(() => {
    const handleNavigationEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.section === 'number') {
        setActiveSection(customEvent.detail.section);
      }
    };

    window.addEventListener('navigate-section', handleNavigationEvent);
    
    return () => {
      window.removeEventListener('navigate-section', handleNavigationEvent);
    };
  }, []);

  // פונקציות חדשות לטיפול בטופס יצירת קשר
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
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
        throw new Error(data.error || 'שגיאה בשליחת הטופס');
      }
      
      // איפוס הטופס
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
      
      // הצגת הודעת הצלחה למשך 3 שניות
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, isSuccess: false }));
      }, 3000);
      
    } catch (error) {
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'שגיאה בלתי צפויה'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"
        />
      </div>
    );
  }

  return (
    <div style={styles.container} ref={containerRef}>
      <Navbar />
      
      {/* נקודות ניווט */}
      <div style={styles.paginationDots}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            style={{
              ...styles.paginationDot,
              ...(activeSection === index ? styles.activeDot : {})
            }}
            onClick={() => scrollToSection(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
      
      {/* מיכל לכל החלקים */}
      <div style={styles.sectionContainer}>
        {/* אזור התמונה המרכזית */}
        <motion.section
          ref={heroSectionRef}
          id="section-home"
          style={{
            ...styles.heroSection,
            position: 'absolute',
            width: '100%',
            top: 0,
            left: 0,
          }}
          initial={false}
          animate={{
            y: activeSection === 0 ? 0 : '-100vh',
            opacity: activeSection === 0 ? 1 : 0
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            opacity: { duration: 0.5 }
          }}
        >
          <motion.div 
            style={styles.imageWrapper}
          >
            <motion.div 
              style={styles.backgroundSlider}
              animate="animate"
              variants={sliderVariants}
            >
              {(shuffledImages.length > 0 ? shuffledImages : backgroundImages).map((image, index) => (
                <motion.div 
                  key={index} 
                  style={{ 
                    width: '19.8%',
                    height: '100%',
                    padding: 0,
                    margin: '0 1px',
                    backgroundColor: '#fbf7f3',
                    borderRadius: 4,
                    boxShadow: 'none',
                    overflow: 'hidden',
                  }} 
                  initial={{ opacity: 0.9 }}
                  animate={{ 
                    opacity: 1,
                    transition: { duration: 1.5 }
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(251, 247, 243, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    padding: 0,
                    margin: 0,
                  }}>
                    <Image
                      src={image}
                      alt={`Wedding background ${index + 1}`}
                      width={1920}
                      height={1080}
                      priority={index === 0}
                      style={styles.backgroundImage}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div style={styles.overlay} />
          </motion.div>

          {/* תוכן ראשי מעל התמונה */}
          <div style={styles.heroContent}>
            <div style={styles.titleContainer}>
              <motion.h1 
                initial="hidden"
                animate="visible"
                variants={firstTitleVariants}
                style={styles.mainTitle}
              >
               Create
              </motion.h1>
              <motion.h2 
                initial="hidden"
                animate="visible"
                variants={secondTitleVariants}
                style={styles.secondaryTitle}
              >
                Plan
              </motion.h2>
              <motion.h3 
                initial="hidden"
                animate="visible"
                variants={thirdTitleVariants}
                style={styles.tertiaryTitle}
              >
                Love
              </motion.h3>
            </div>
            
            <motion.p 
              initial="hidden"
              animate="visible"
              variants={subtitleVariants}
              style={styles.subtitle}
            >
              הדרך הקלה לתכנן את החתונה המושלמת
            </motion.p>
            
            <div style={styles.ctaButtons}>
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={buttonVariants}
                whileHover="hover"
              >
                <Link 
                  href={user ? `/user/${user._id}` : '/login'} 
                  style={styles.primaryButton}
                >
                  התחל לתכנן
                </Link>
              </motion.div>
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={buttonVariants}
                whileHover="hover"
              >
                <Link 
                  href="#about-section" 
                  style={styles.secondaryButton}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(1);
                  }}
                >
                  למד עוד
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* תוכן נוסף מתחת לתמונה */}
        <motion.div
          ref={aboutSectionRef}
          id="section-services"
          style={{
            ...styles.additionalContent,
            position: 'absolute',
            width: '100%',
            top: 0,
            left: 0,
          }}
          initial={false}
          animate={{
            y: activeSection === 1 ? 0 : activeSection < 1 ? '100vh' : '-100vh',
            opacity: activeSection === 1 ? 1 : 0
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            opacity: { duration: 0.5 }
          }}
        >
          <div style={styles.servicesSection}>
            <div style={styles.servicesHero}></div>
            <div style={styles.servicesContent}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: activeSection === 1 ? 1 : 0, y: activeSection === 1 ? 0 : 30 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{ textAlign: 'center', marginBottom: '1.5rem' }}
              >
                <h2 style={styles.sectionTitle}>
                  השירותים שלנו
                  <div style={styles.sectionTitleDecorator}></div>
                </h2>
                <p style={{ 
                  fontSize: '1.3rem', 
                  maxWidth: '800px', 
                  margin: '2rem auto',
                  color: '#666',
                  lineHeight: '1.7'
                }}>
                  אנו מספקים מגוון שירותים מקצועיים לתכנון וארגון החתונה המושלמת עבורכם, 
                  מהשלבים הראשוניים ועד הרגע המיוחד, הכל במקום אחד.
                </p>
              </motion.div>
              
              <motion.div 
                style={styles.servicesGrid}
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.div 
                  variants={cardVariants} 
                  style={styles.serviceCard}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    y: -10
                  }}
                >
                  <div style={styles.serviceCardIcon}>
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <h3 style={styles.serviceCardTitle}>תכנון אירועים</h3>
                  <p style={styles.serviceCardDesc}>ניהול מקיף של כל פרטי החתונה מא׳ ועד ת׳, כולל תיאום ספקים, לוחות זמנים וניהול תקציב.</p>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    show: { 
                      opacity: 1, 
                      y: 0, 
                      transition: { duration: 0.5, ease: 'easeOut' } 
                    }
                  }} 
                  style={styles.serviceCard}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    y: -10
                  }}
                >
                  <div style={styles.serviceCardIcon}>
                    <i className="fas fa-handshake"></i>
                  </div>
                  <h3 style={styles.serviceCardTitle}>ספקים מומלצים</h3>
                  <p style={styles.serviceCardDesc}>רשימת ספקים מובחרת ומומלצת, כולל ביקורות, מחירים והשוואה קלה ונוחה ביניהם.</p>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    show: { 
                      opacity: 1, 
                      x: 0, 
                      transition: { duration: 0.5, ease: 'easeOut' } 
                    }
                  }} 
                  style={styles.serviceCard}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    y: -10
                  }}
                >
                  <div style={styles.serviceCardIcon}>
                    <i className="fas fa-coins"></i>
                  </div>
                  <h3 style={styles.serviceCardTitle}>ניהול תקציב</h3>
                  <p style={styles.serviceCardDesc}>כלים לניהול וחישוב התקציב, מעקב אחר הוצאות, התראות ומערכת תשלומים חכמה.</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* מסך יצירת קשר */}
        <motion.div
          ref={contactSectionRef}
          id="section-contact"
          style={{
            ...styles.contactSection,
            position: 'absolute',
            width: '100%',
            top: 0,
            left: 0,
            zIndex: 1000,
          }}
          initial={false}
          animate={{
            y: activeSection === 2 ? 0 : '100vh',
            opacity: activeSection === 2 ? 1 : 0
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            opacity: { duration: 0.5 }
          }}
        >
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>צור קשר</h2>
            <div style={styles.contactForm}>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>שם מלא</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.formInput} 
                    placeholder="הזן את שמך המלא" 
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>כתובת אימייל</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.formInput} 
                    placeholder="הזן את כתובת האימייל שלך" 
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>מספר טלפון</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={styles.formInput} 
                    placeholder="הזן את מספר הטלפון שלך" 
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>הודעה</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    style={styles.formTextarea} 
                    placeholder="כתוב את הודעתך כאן..."
                    required
                  ></textarea>
                </div>
                
                {formStatus.isSuccess && (
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#d4edda', 
                    color: '#155724',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}>
                    ההודעה נשלחה בהצלחה!
                  </div>
                )}
                
                {formStatus.isError && (
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}>
                    {formStatus.errorMessage}
                  </div>
                )}
                
                <motion.button 
                  type="submit" 
                  style={styles.submitButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={formStatus.isSubmitting}
                >
                  {formStatus.isSubmitting ? 'שולח...' : 'שלח הודעה'}
                </motion.button>
              </form>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
