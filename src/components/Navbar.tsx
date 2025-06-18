'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // אם אנחנו בדף הזמנה או רישום עם הזמנה - לא להציג את ה-navbar
  const hideNavbarPaths = ['/accept-invitation', '/register-with-invitation'];
  if (hideNavbarPaths.some(path => pathname?.includes(path))) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (!user) return;
    
    if (user.isProfileComplete) {
      router.push(`/user/${user._id}`);
    } else {
      router.push('/complete-profile');
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (callback: () => void) => {
    callback();
    setIsMobileMenuOpen(false);
  };

  // אנימציות למעברים חלקים
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <nav className="bg-gradient-to-r from-pink-50 via-white to-rose-100/80 shadow-lg backdrop-blur-md fixed w-full top-0 z-[1000] border-b border-pink-100/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20 relative">
          
          {/* קישורי ניווט - דסקטופ בלבד */}
          <div className="hidden lg:flex flex-1 justify-start">
            <div className="flex space-x-8 rtl:space-x-reverse">
              <Link 
                href="/#section-home" 
                className="text-gray-700 hover:text-pink-500 px-3 py-2 text-sm font-medium transition-colors relative group"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === '/') {
                    const event = new CustomEvent('navigate-section', { 
                      detail: { section: 0 } 
                    });
                    window.dispatchEvent(event);
                  } else {
                    router.push('/#section-home');
                  }
                }}
              >
                דף הבית
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/services" 
                className="text-gray-700 hover:text-pink-500 px-3 py-2 text-sm font-medium transition-colors relative group"
              >
                ספקים
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/#section-contact" 
                className="text-gray-700 hover:text-pink-500 px-3 py-2 text-sm font-medium transition-colors relative group"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === '/') {
                    const event = new CustomEvent('navigate-section', { 
                      detail: { section: 2 } 
                    });
                    window.dispatchEvent(event);
                  } else {
                    router.push('/#section-contact');
                  }
                }}
              >
                צור קשר
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-pink-500 px-3 py-2 text-sm font-medium transition-colors relative group"
              >
                אודות
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          {/* לוגו - מרכז */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link 
              href="/#section-home" 
              className="text-xl lg:text-2xl font-normal text-pink-500 font-[var(--font-pacifico)] pacifico-font transition-all duration-300 hover:text-pink-600 hover:scale-105"
              style={{ fontFamily: 'var(--font-pacifico), "Pacifico", cursive' }}
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname === '/') {
                  const event = new CustomEvent('navigate-section', { 
                    detail: { section: 0 } 
                  });
                  window.dispatchEvent(event);
                } else {
                  router.push('/#section-home');
                }
              }}
            >
              Wedding Planner
            </Link>
          </div>

          {/* כפתורי אימות - דסקטופ */}
          <div className="hidden lg:flex flex-1 justify-end">
            <AnimatePresence mode="wait">
              {!isAuthReady ? (
                <motion.div 
                  key="loading"
                  className="flex items-center gap-2"
                  {...fadeIn}
                >
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </motion.div>
              ) : user ? (
                <motion.div 
                  key="logged-in"
                  className="flex items-center gap-4"
                  {...fadeIn}
                >
                  <span className="text-gray-600 font-medium text-sm">
                    שלום, {user.fullName}
                  </span>
                  <button 
                    onClick={handleProfileClick} 
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      user.isProfileComplete 
                        ? 'bg-pink-500 text-white hover:bg-pink-600' 
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {user.isProfileComplete ? 'הפרופיל שלי' : 'השלם פרופיל'}
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="bg-rose-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-rose-600"
                  >
                    התנתק
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="logged-out"
                  className="flex items-center gap-4"
                  {...fadeIn}
                >
                  <Link 
                    href="/login" 
                    className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-pink-600"
                  >
                    התחבר
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-rose-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-rose-500"
                  >
                    הרשמה
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* כפתור המבורגר */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
            >
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* תפריט מובייל */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="lg:hidden bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/#section-home" 
                className="text-gray-700 hover:text-pink-500 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(() => {
                    if (window.location.pathname === '/') {
                      const event = new CustomEvent('navigate-section', { 
                        detail: { section: 0 } 
                      });
                      window.dispatchEvent(event);
                    } else {
                      router.push('/#section-home');
                    }
                  });
                }}
              >
                דף הבית
              </Link>
              <Link 
                href="/services" 
                className="text-gray-700 hover:text-pink-500 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => handleNavClick(() => router.push('/services'))}
              >
                ספקים
              </Link>
              <Link 
                href="/#section-contact" 
                className="text-gray-700 hover:text-pink-500 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(() => {
                    if (window.location.pathname === '/') {
                      const event = new CustomEvent('navigate-section', { 
                        detail: { section: 2 } 
                      });
                      window.dispatchEvent(event);
                    } else {
                      router.push('/#section-contact');
                    }
                  });
                }}
              >
                צור קשר
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-pink-500 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                אודות
              </Link>
            </div>
            
            {/* כפתורי אימות במובייל */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <AnimatePresence mode="wait">
                {!isAuthReady ? (
                  <motion.div 
                    key="loading-mobile"
                    className="flex items-center justify-center gap-2 px-3 py-2"
                    {...fadeIn}
                  >
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </motion.div>
                ) : user ? (
                  <motion.div 
                    key="logged-in-mobile"
                    className="px-3 space-y-2"
                    {...fadeIn}
                  >
                    <div className="text-center text-gray-600 font-medium py-2">
                      שלום, {user.fullName}
                    </div>
                    <button 
                      onClick={handleProfileClick} 
                      className={`w-full px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                        user.isProfileComplete 
                          ? 'bg-pink-500 text-white hover:bg-pink-600' 
                          : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}
                    >
                      {user.isProfileComplete ? 'הפרופיל שלי' : 'השלם פרופיל'}
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="w-full bg-rose-500 text-white px-4 py-2 rounded-md text-base font-medium transition-all duration-300 hover:bg-rose-600"
                    >
                      התנתק
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="logged-out-mobile"
                    className="px-3 space-y-2"
                    {...fadeIn}
                  >
                    <Link 
                      href="/login" 
                      className="block w-full bg-pink-500 text-white px-4 py-2 rounded-md text-base font-medium text-center transition-all duration-300 hover:bg-pink-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      התחבר
                    </Link>
                    <Link 
                      href="/register" 
                      className="block w-full bg-rose-400 text-white px-4 py-2 rounded-md text-base font-medium text-center transition-all duration-300 hover:bg-rose-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      הרשמה
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
