'use client';
import './globals.css';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import { useEffect, useState, useRef, FormEvent, useCallback, useMemo } from 'react';
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

export default function HomePage() {
  const { login, user } = useAuth();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<string[]>([]);
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const sectionTransitionTimeout = useRef<NodeJS.Timeout | null>(null);
  
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
  const backgroundImages = useMemo(() => [
    '/images/wedding-background.jpg',
    '/images/311691308_10223945859767494_4494901931895656765_n.jpg',
    '/images/430853596_10226981026324761_6445618788012733513_n.jpg',
    '/images/475104690_10229871826952970_7379256486698947066_n.jpg',
    '/images/475280938_10229871827872993_8154661980827464805_n.jpg',
  ], []);

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

  // אנימציה לסרגל התמונות - רצף ללא הפסקה
  const sliderVariants = {
    animate: {
      x: ['0%', '-25%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop' as const,
          duration: 25,
          ease: 'linear',
          repeatDelay: 0
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

  // פונקציה לטעינת תמונות מדורגת
  const preloadImages = async () => {
    try {
      console.log('Starting image preload...');
      const imagePromises = backgroundImages.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            console.log(`Image loaded: ${src}`);
            resolve(src);
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            setImageLoadErrors(prev => [...prev, src]);
            reject(src);
          };
          img.src = src;
        });
      });
      
      // המתנה לכל התמונות (גם אלו שנכשלו)
      const results = await Promise.allSettled(imagePromises);
      const loadedImages = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<string>).value);
      
      console.log(`Images loaded successfully: ${loadedImages.length}/${backgroundImages.length}`);
      setImagesLoaded(true);
    } catch (error) {
      console.error('Error during image preload:', error);
      setImagesLoaded(true); // להמשיך גם אם יש שגיאות
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

    // ערבוב התמונות וטעינה מדורגת
    setShuffledImages(shuffleArray(backgroundImages));
    preloadImages();
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
        // מעכב קצת כדי לוודא שהתמונות התחילו להיטען
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
    };

    initializeUser();
  }, [searchParams, login]);

  // מעבר בין חלקי העמוד עם גלילה - מוכן עם useCallback
  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    // Debouncing מופחת למניעת רגישות יתר
    if (now - lastScrollTime.current < 100) return;
    lastScrollTime.current = now;
    
    // מניעת טריגר כפול
    if (isScrolling.current) return;
    isScrolling.current = true;
    
    // שימוש ב-requestAnimationFrame לביצועים טובים יותר
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    animationFrameId.current = requestAnimationFrame(() => {
      const currentSection = activeSection;
      let nextSection = currentSection;
      
      if (e.deltaY > 0) {
        // גלילה למטה
        nextSection = currentSection < 2 ? currentSection + 1 : currentSection;
      } else {
        // גלילה למעלה
        nextSection = currentSection > 0 ? currentSection - 1 : currentSection;
      }
      
      console.log('Scroll from section:', currentSection, 'to section:', nextSection);
      
      if (nextSection !== currentSection) {
        setActiveSection(nextSection);
      }
      
      // זמן נעילה קצר יותר אבל עקבי
      setTimeout(() => {
        isScrolling.current = false;
      }, 600);
    });
  }, [activeSection]); // הוספת activeSection כ-dependency

  // גלילה למיקום ספציפי על פי לחיצת קישור - מוכן עם useCallback
  const scrollToSection = useCallback((sectionId: number) => {
    if (isScrolling.current) return;
    
    console.log('Manual scroll to section:', sectionId);
    
    isScrolling.current = true;
    
    // שימוש ב-requestAnimationFrame לביצועים טובים יותר
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    animationFrameId.current = requestAnimationFrame(() => {
      setActiveSection(sectionId);
      
      setTimeout(() => {
        isScrolling.current = false;
      }, 600);
    });
  }, []);

  // טיפול באירועי מגע - מוכן עם useCallback
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isScrolling.current) return;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isScrolling.current) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchStartY.current - touchY;
    
    // רגישות גבוהה יותר למגע
    if (Math.abs(diff) < 50) return;
    
    e.preventDefault();
    isScrolling.current = true;
    
    // שימוש ב-requestAnimationFrame לביצועים טובים יותר
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    animationFrameId.current = requestAnimationFrame(() => {
      const currentSection = activeSection;
      let nextSection = currentSection;
      
      if (diff > 0) {
        nextSection = currentSection < 2 ? currentSection + 1 : currentSection;
      } else {
        nextSection = currentSection > 0 ? currentSection - 1 : currentSection;
      }
      
      console.log('Touch from section:', currentSection, 'to section:', nextSection);
      
      if (nextSection !== currentSection) {
        setActiveSection(nextSection);
      }
      
      setTimeout(() => {
        isScrolling.current = false;
      }, 600);
    });
  }, [activeSection]);

  // אירוע גלילה - עם ניקוי משופר
  useEffect(() => {
    // ניקוי event listeners קודמים אם יש
    const cleanup = () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      document.body.style.overflow = 'auto';
      
      // ניקוי timeouts ו-animationFrames
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      
      if (sectionTransitionTimeout.current) {
        clearTimeout(sectionTransitionTimeout.current);
        sectionTransitionTimeout.current = null;
      }
    };
    
    cleanup(); // ניקוי ראשוני
    
    // הוספת event listeners חדשים
    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    document.body.style.overflow = 'hidden';
    
    return cleanup;
  }, [handleScroll, handleTouchStart, handleTouchMove]);

  // מעקב אחרי שינויים ב-activeSection להבטחת מעבר חלק
  useEffect(() => {
    console.log('Active section changed to:', activeSection);
    
    // ניקוי timeout קודם אם יש
    if (sectionTransitionTimeout.current) {
      clearTimeout(sectionTransitionTimeout.current);
    }
    
    // הבטחה שהמערכת תשחרר את הנעילה אחרי זמן קבוע
    sectionTransitionTimeout.current = setTimeout(() => {
      if (isScrolling.current) {
        console.log('Force releasing scroll lock');
        isScrolling.current = false;
      }
    }, 1000); // timeout חירום
    
    return () => {
      if (sectionTransitionTimeout.current) {
        clearTimeout(sectionTransitionTimeout.current);
        sectionTransitionTimeout.current = null;
      }
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
      
      // הצגת הודעת הצלחה למשך 2 שניות ואז העברה לסקשן הראשון
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, isSuccess: false }));
        // מעבר לסקשן הראשון
        setActiveSection(0);
      }, 2000);
      
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f4f0]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-[var(--font-heebo)]">טוען את חוויית החתונה שלך...</p>
          <p className="text-sm text-gray-400 mt-2 font-[var(--font-heebo)]">זה יכול לקחת כמה שניות</p>
          {!imagesLoaded && (
            <p className="text-xs text-gray-300 mt-2 font-[var(--font-heebo)]">
              טוען תמונות ({backgroundImages.length - imageLoadErrors.length}/{backgroundImages.length})
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f9f4f0] overflow-hidden" ref={containerRef}>
      <Navbar />
      
      {/* נקודות ניווט */}
      <div className="fixed right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 sm:gap-3 lg:gap-4 z-[100] p-1 sm:p-2 rounded-2xl sm:rounded-3xl shadow-lg bg-white/20 backdrop-blur-sm sm:right-4 lg:right-8 laptop-sm:right-3 laptop-sm:gap-2 laptop-sm:p-1.5">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full cursor-pointer transition-all duration-300 border border-pink-500/30 ${
              activeSection === index 
                ? 'bg-pink-500 scale-125 shadow-lg shadow-pink-500/50' 
                : 'bg-white/70 hover:bg-pink-200'
            } laptop-sm:w-2.5 laptop-sm:h-2.5 laptop-md:w-3 laptop-md:h-3`}
            onClick={() => scrollToSection(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
      
      {/* מיכל לכל החלקים */}
      <div className="relative w-full min-h-screen overflow-hidden" style={{ minHeight: '100dvh' }}>
        {/* אזור התמונה המרכזית */}
        <motion.section
          ref={heroSectionRef}
          id="section-home"
          className="absolute inset-0 w-full flex items-center justify-center overflow-hidden bg-[#fbf7f3] section-container"
          style={{ minHeight: '100dvh' }}
          initial={false}
          animate={{
            y: activeSection === 0 ? 0 : '-100vh',
            opacity: activeSection === 0 ? 1 : 0
          }}
          transition={{
            type: 'tween',
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <motion.div 
            className="absolute inset-0 flex justify-center items-center overflow-hidden"
          >
            <motion.div 
              className="absolute flex overflow-hidden gap-0.5"
              style={{
                width: '800%', // הגדלת רוחב עבור 4 עותקים של תמונות
                height: '100%',
              }}
              animate="animate"
              variants={sliderVariants}
            >
              {/* יצירת 4 עותקים של התמונות לרצף חלק */}
              {[...Array(4)].map((_, groupIndex) => 
                (shuffledImages.length > 0 ? shuffledImages : backgroundImages).map((image, index) => (
                  <motion.div 
                    key={`group-${groupIndex}-${index}`} 
                    className="flex-shrink-0 bg-[#fbf7f3] rounded overflow-hidden"
                    style={{ 
                      width: '2.48%', // חלוקה ל-40 תמונות (5 תמונות × 8 קבוצות)
                      height: '100%',
                      margin: '0 1px',
                    }} 
                    initial={{ opacity: 0.9 }}
                    animate={{ 
                      opacity: 1,
                      transition: { duration: 1.5 }
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-[#f9f4f0] to-[#fff5f8] flex justify-center items-center overflow-hidden">
                      {!imagesLoaded ? (
                        <div className="w-full h-full bg-gradient-to-r from-[#f9f4f0] to-[#fff5f8] flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <Image
                          src={image}
                          alt={`Wedding background ${index + 1}`}
                          width={1920}
                          height={1080}
                          priority={groupIndex === 0 && index === 0}
                          className="w-full h-full object-contain object-center"
                          onLoad={() => console.log(`Image loaded: ${image}`)}
                          onError={() => console.error(`Failed to load: ${image}`)}
                        />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
            <div className="absolute inset-0 bg-[#fbf7f3]/20 z-[1]" />
          </motion.div>

          {/* תוכן ראשי מעל התמונה */}
          <div className="relative z-[2] text-center text-white p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 max-w-5xl flex flex-col items-center justify-center mx-auto">
            <div className="flex flex-col items-center mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <motion.h1 
                initial="hidden"
                animate="visible"
                variants={firstTitleVariants}
                className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-0.5 sm:mb-1 text-shadow-lg font-[var(--font-playfair)] text-white leading-tight laptop-sm:text-5xl laptop-md:text-6xl"
              >
               Create
              </motion.h1>
              <motion.h2 
                initial="hidden"
                animate="visible"
                variants={secondTitleVariants}
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-0.5 sm:mb-1 text-shadow-lg font-[var(--font-playfair)] text-white/90 leading-tight laptop-sm:text-4xl laptop-md:text-5xl"
              >
                Plan
              </motion.h2>
              <motion.h3 
                initial="hidden"
                animate="visible"
                variants={thirdTitleVariants}
                className="text-xl xs:text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-shadow-lg font-[var(--font-playfair)] text-white/80 leading-tight laptop-sm:text-2xl laptop-md:text-3xl"
              >
                Love
              </motion.h3>
            </div>
            
            <motion.p 
              initial="hidden"
              animate="visible"
              variants={subtitleVariants}
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl mb-6 sm:mb-8 lg:mb-10 text-shadow font-medium max-w-xl px-2 sm:px-4 laptop-sm:text-lg laptop-sm:mb-6"
            >
              הדרך הקלה לתכנן את החתונה המושלמת
            </motion.p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 justify-center items-center w-full max-w-sm sm:max-w-none px-2 sm:px-0 laptop-sm:gap-3">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={buttonVariants}
                whileHover="hover"
                className="w-full sm:w-auto"
              >
                <Link 
                  href={user ? `/user/${user._id}` : '/login'} 
                  className="inline-block w-full sm:w-auto bg-pink-500 text-white py-2.5 xs:py-3 sm:py-3 px-5 xs:px-6 sm:px-8 rounded-full text-sm xs:text-base sm:text-lg font-bold transition-all duration-300 border-2 border-transparent shadow-lg shadow-pink-500/30 text-center hover:bg-pink-600 hover:shadow-xl laptop-sm:py-2.5 laptop-sm:px-6 laptop-sm:text-base"
                >
                  התחל לתכנן
                </Link>
              </motion.div>
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={buttonVariants}
                whileHover="hover"
                className="w-full sm:w-auto"
              >
                <Link 
                  href="#about-section" 
                  className="inline-block w-full sm:w-auto bg-transparent text-white py-2.5 xs:py-3 sm:py-3 px-5 xs:px-6 sm:px-8 rounded-full text-sm xs:text-base sm:text-lg font-bold transition-all duration-300 border-2 border-white text-center hover:bg-white hover:text-pink-500 laptop-sm:py-2.5 laptop-sm:px-6 laptop-sm:text-base"
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
          className="absolute inset-0 w-full overflow-auto bg-[#f9f4f0] flex flex-col justify-center py-4 sm:py-8 lg:py-16 section-container"
          style={{ minHeight: '100dvh' }}
          initial={false}
          animate={{
            y: activeSection === 1 ? 0 : activeSection < 1 ? '100vh' : '-100vh',
            opacity: activeSection === 1 ? 1 : 0
          }}
          transition={{
            type: 'tween',
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <div className="relative overflow-hidden bg-gradient-to-b from-[#f9f4f0] to-[#fff5f8] py-6 sm:py-12 md:py-16 lg:py-20 xl:py-24 px-3 sm:px-4 md:px-6 lg:px-8 laptop-sm:py-8 laptop-sm:px-4">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/10 via-transparent to-pink-200/10" />
            <div className="relative z-2 max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: activeSection === 1 ? 1 : 0, y: activeSection === 1 ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-12 laptop-sm:mb-6"
              >
                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-gray-800 text-center mb-3 sm:mb-6 md:mb-8 lg:mb-12 font-[var(--font-shrikhand)] relative inline-block px-2 laptop-sm:text-3xl laptop-sm:mb-4 laptop-md:text-4xl">
                  השירותים שלנו
                  <div className="w-16 sm:w-20 md:w-24 xl:w-28 h-0.5 sm:h-1 bg-gradient-to-r from-pink-500 to-pink-300 mx-auto mt-2 sm:mt-4 rounded-full laptop-sm:w-16 laptop-sm:mt-2" />
                </h2>
                <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl max-w-5xl mx-auto text-gray-600 leading-relaxed px-2 sm:px-4 md:px-6 laptop-sm:text-base laptop-sm:max-w-4xl laptop-md:text-lg">
                  אנו מספקים מגוון שירותים מקצועיים לתכנון וארגון החתונה המושלמת עבורכם, 
                  מהשלבים הראשוניים ועד הרגע המיוחד, הכל במקום אחד.
                </p>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 mt-4 sm:mt-6 md:mt-8 laptop-sm:gap-4 laptop-sm:mt-4"
                variants={containerVariants}
                initial="hidden"
                animate={activeSection === 1 ? "show" : "hidden"}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.div 
                  variants={cardVariants} 
                  className="bg-white p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 rounded-lg sm:rounded-xl shadow-lg text-center transition-all duration-400 border border-pink-100/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 laptop-sm:p-4 laptop-md:p-6"
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    y: -10
                  }}
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-pink-500 mb-2 sm:mb-4 md:mb-6 inline-block laptop-sm:text-3xl laptop-sm:mb-3 laptop-md:text-4xl">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 md:mb-4 laptop-sm:text-lg laptop-sm:mb-2 laptop-md:text-xl">תכנון אירועים</h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed laptop-sm:text-sm laptop-md:text-base">ניהול מקיף של כל פרטי החתונה מא׳ ועד ת׳, כולל תיאום ספקים, לוחות זמנים וניהול תקציב.</p>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    show: { 
                      opacity: 1, 
                      y: 0, 
                      transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 } 
                    }
                  }} 
                  className="bg-white p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 rounded-lg sm:rounded-xl shadow-lg text-center transition-all duration-400 border border-pink-100/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 laptop-sm:p-4 laptop-md:p-6"
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    y: -10
                  }}
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-pink-500 mb-2 sm:mb-4 md:mb-6 inline-block laptop-sm:text-3xl laptop-sm:mb-3 laptop-md:text-4xl">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 md:mb-4 laptop-sm:text-lg laptop-sm:mb-2 laptop-md:text-xl">ספקים מומלצים</h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed laptop-sm:text-sm laptop-md:text-base">רשימת ספקים מובחרת ומומלצת, כולל ביקורות, מחירים והשוואה קלה ונוחה ביניהם.</p>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    show: { 
                      opacity: 1, 
                      x: 0, 
                      transition: { duration: 0.6, ease: 'easeOut', delay: 0.4 } 
                    }
                  }} 
                  className="bg-white p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 rounded-lg sm:rounded-xl shadow-lg text-center transition-all duration-400 border border-pink-100/50 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 md:col-span-2 lg:col-span-1 laptop-sm:p-4 laptop-md:p-6"
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    y: -10
                  }}
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-pink-500 mb-2 sm:mb-4 md:mb-6 inline-block laptop-sm:text-3xl laptop-sm:mb-3 laptop-md:text-4xl">
                    <i className="fas fa-coins"></i>
                  </div>
                  <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 md:mb-4 laptop-sm:text-lg laptop-sm:mb-2 laptop-md:text-xl">ניהול תקציב</h3>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed laptop-sm:text-sm laptop-md:text-base">כלים לניהול וחישוב התקציב, מעקב אחר הוצאות, התראות ומערכת תשלומים חכמה.</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* מסך יצירת קשר */}
        <motion.div
          ref={contactSectionRef}
          id="section-contact"
          className="absolute inset-0 w-full bg-[#f6f1ec] flex flex-col justify-center py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12 px-3 sm:px-4 md:px-6 lg:px-8 z-[1000] overflow-auto section-container laptop-sm:py-6 laptop-sm:px-4"
          style={{ minHeight: '100dvh' }}
          initial={false}
          animate={{
            y: activeSection === 2 ? 0 : '100vh',
            opacity: activeSection === 2 ? 1 : 0
          }}
          transition={{
            type: 'tween',
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <section className="max-w-4xl xl:max-w-5xl mx-auto w-full laptop-sm:max-w-3xl">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-gray-800 text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12 font-[var(--font-shrikhand)] relative inline-block w-full laptop-sm:text-3xl laptop-sm:mb-4 laptop-md:text-4xl">
              צור קשר
              <div className="w-16 sm:w-20 md:w-24 xl:w-28 h-0.5 sm:h-1 bg-gradient-to-r from-pink-500 to-pink-300 mx-auto mt-2 sm:mt-4 rounded-full laptop-sm:w-16 laptop-sm:mt-2" />
            </h2>
            <div className="w-full max-w-4xl xl:max-w-5xl mx-auto bg-white p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 rounded-lg shadow-lg laptop-sm:max-w-3xl laptop-sm:p-5 laptop-md:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8 laptop-sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 laptop-sm:gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm md:text-base font-bold text-gray-800 mb-1 sm:mb-2 laptop-sm:text-sm laptop-sm:mb-1">שם מלא</label>
                    <input 
                      id="name"
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2.5 sm:p-3 md:p-4 lg:p-5 border border-gray-300 rounded-md text-sm sm:text-base md:text-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all laptop-sm:p-2.5 laptop-sm:text-sm laptop-md:p-3 laptop-md:text-base" 
                      placeholder="הזן את שמך המלא" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm md:text-base font-bold text-gray-800 mb-1 sm:mb-2 laptop-sm:text-sm laptop-sm:mb-1">כתובת אימייל</label>
                    <input 
                      id="email"
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2.5 sm:p-3 md:p-4 lg:p-5 border border-gray-300 rounded-md text-sm sm:text-base md:text-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all laptop-sm:p-2.5 laptop-sm:text-sm laptop-md:p-3 laptop-md:text-base" 
                      placeholder="הזן את כתובת האימייל שלך" 
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm md:text-base font-bold text-gray-800 mb-1 sm:mb-2 laptop-sm:text-sm laptop-sm:mb-1">מספר טלפון</label>
                  <input 
                    id="phone"
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2.5 sm:p-3 md:p-4 lg:p-5 border border-gray-300 rounded-md text-sm sm:text-base md:text-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all laptop-sm:p-2.5 laptop-sm:text-sm laptop-md:p-3 laptop-md:text-base" 
                    placeholder="הזן את מספר הטלפון שלך" 
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm md:text-base font-bold text-gray-800 mb-1 sm:mb-2 laptop-sm:text-sm laptop-sm:mb-1">הודעה</label>
                  <textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full p-2.5 sm:p-3 md:p-4 lg:p-5 border border-gray-300 rounded-md text-sm sm:text-base md:text-lg min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px] xl:min-h-[180px] resize-vertical focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all laptop-sm:p-2.5 laptop-sm:text-sm laptop-sm:min-h-[100px] laptop-md:p-3 laptop-md:text-base laptop-md:min-h-[120px]" 
                    placeholder="כתוב את הודעתך כאן..."
                    required
                  />
                </div>
                
                {formStatus.isSuccess && (
                  <div className="p-3 sm:p-4 md:p-5 bg-green-100 text-green-800 rounded-md border border-green-300 text-sm sm:text-base md:text-lg laptop-sm:p-3 laptop-sm:text-sm laptop-md:text-base">
                    ההודעה נשלחה בהצלחה!
                  </div>
                )}
                
                {formStatus.isError && (
                  <div className="p-3 sm:p-4 md:p-5 bg-red-100 text-red-800 rounded-md border border-red-300 text-sm sm:text-base md:text-lg laptop-sm:p-3 laptop-sm:text-sm laptop-md:text-base">
                    {formStatus.errorMessage}
                  </div>
                )}
                
                <motion.button 
                  type="submit" 
                  className="w-full bg-pink-500 text-white py-2.5 sm:py-3 md:py-4 lg:py-5 px-4 sm:px-6 md:px-8 rounded-full text-sm sm:text-base md:text-lg lg:text-xl font-bold border-none cursor-pointer transition-all duration-300 shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 sm:gap-3 hover:bg-pink-600 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed laptop-sm:py-2.5 laptop-sm:px-4 laptop-sm:text-sm laptop-md:py-3 laptop-md:text-base"
                  whileHover={{ scale: formStatus.isSubmitting ? 1 : 1.05 }}
                  whileTap={{ scale: formStatus.isSubmitting ? 1 : 0.95 }}
                  disabled={formStatus.isSubmitting}
                >
                  {formStatus.isSubmitting && (
                    <div className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin laptop-sm:w-4 laptop-sm:h-4 laptop-md:w-5 laptop-md:h-5" />
                  )}
                  {formStatus.isSubmitting ? 'שולח...' : 'שלח הודעה'}
                </motion.button>
              </form>
            </div>
          </section>
        </motion.div>
      </div>
      
      {/* הוספת סגנון גלובלי */}
      <style dangerouslySetInnerHTML={{ 
        __html: `
          @keyframes loaderSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .text-shadow {
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
          }
          
          .text-shadow-lg {
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        ` 
      }} />
    </div>
  );
}
