'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  const router = useRouter();
  
  const navigateToContact = () => {
    router.push('/#section-contact');
  };
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-pink-500 mb-4 sm:mb-6">
              קצת עלינו...
            </h1>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full mx-auto"></div>
          </div>
          
          {/* Content */}
          <div className="grid gap-8 sm:gap-10 lg:gap-12">
            {/* Who We Are Section */}
            <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8 p-6 sm:p-8 lg:p-10">
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-4xl shadow-lg shadow-pink-500/25">
                  <i className="fas fa-users"></i>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
                    מי אנחנו?
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                    ב-Wedding Planner אנחנו מאמינים שכל סיפור אהבה ראוי לחתונה מהחלומות. לכן יצרנו עבורכם פלטפורמה שתלווה אתכם צעד אחר 
                    צעד – מההצעה המרגשת ועד לריקוד הראשון. עם מגוון ספקים איכותיים, טיפים שיחסכו 
                    לכם כאבי ראש וכלים שיעזרו לשמור על סדר ותקציב,
                    אנחנו כאן כדי שתוכלו להתמקד בדבר הכי חשוב – האהבה שלכם.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Services Section */}
            <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8 p-6 sm:p-8 lg:p-10">
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-4xl shadow-lg shadow-pink-500/25">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
                    השירותים שלנו
                  </h2>
                  <ul className="space-y-3 sm:space-y-4">
                    <li className="flex items-center text-base sm:text-lg lg:text-xl text-gray-700 hover:transform hover:-translate-x-1 transition-transform duration-200">
                      <i className="fas fa-search text-pink-500 ml-3 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"></i>
                      <span>חיפוש וסינון ספקים לפי קטגוריות</span>
                    </li>
                    <li className="flex items-center text-base sm:text-lg lg:text-xl text-gray-700 hover:transform hover:-translate-x-1 transition-transform duration-200">
                      <i className="fas fa-wallet text-pink-500 ml-3 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"></i>
                      <span>כלים לניהול תקציב החתונה</span>
                    </li>
                    <li className="flex items-center text-base sm:text-lg lg:text-xl text-gray-700 hover:transform hover:-translate-x-1 transition-transform duration-200">
                      <i className="fas fa-tasks text-pink-500 ml-3 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"></i>
                      <span>רשימת משימות אינטראקטיבית</span>
                    </li>
                    <li className="flex items-center text-base sm:text-lg lg:text-xl text-gray-700 hover:transform hover:-translate-x-1 transition-transform duration-200">
                      <i className="fas fa-comment-dots text-pink-500 ml-3 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"></i>
                      <span>טיפים והמלצות מזוגות אחרים</span>
                    </li>
                    <li className="flex items-center text-base sm:text-lg lg:text-xl text-gray-700 hover:transform hover:-translate-x-1 transition-transform duration-200">
                      <i className="fas fa-envelope-open-text text-pink-500 ml-3 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"></i>
                      <span>מערכת ניהול הזמנות דיגיטלית</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

                         {/* Contact Section */}
             <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
               <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8 p-6 sm:p-8 lg:p-10">
                 <button 
                   className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-4xl shadow-lg shadow-pink-500/25 cursor-pointer hover:bg-pink-600 transition-colors duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                   onClick={navigateToContact}
                   aria-label="עבור לדף צור קשר"
                 >
                   <i className="fas fa-phone-alt"></i>
                 </button>
                 <div className="flex-1">
                   <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
                     <Link 
                       href="/#section-contact" 
                       className="hover:text-pink-500 transition-colors duration-200"
                     >
                       צרו קשר
                     </Link>
                   </h2>
                   <div className="space-y-4 sm:space-y-5">
                     <div className="flex items-center text-base sm:text-lg lg:text-xl text-gray-700">
                       <i className="fas fa-phone text-pink-500 ml-3 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"></i>
                       <span>03-1234567</span>
                     </div>
                     <div className="flex items-center text-base sm:text-lg lg:text-xl text-gray-700">
                       <i className="fas fa-envelope text-pink-500 ml-3 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"></i>
                       <span>info@weddingplanner.co.il</span>
                     </div>
                     <div className="flex items-center text-base sm:text-lg lg:text-xl text-gray-700">
                       <i className="fas fa-map-marker-alt text-pink-500 ml-3 sm:ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"></i>
                       <span>רחוב האהבה 12, תל אביב</span>
                     </div>
                     <div className="pt-4">
                       <button 
                         className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-full transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg shadow-pink-500/30 text-base sm:text-lg"
                         onClick={navigateToContact}
                       >
                         עבור לדף צור קשר
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </section>
           </div>

           {/* Footer with Social Links */}
           <div className="mt-16 sm:mt-20 lg:mt-24 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 text-center">
             <div className="flex justify-center space-x-4 sm:space-x-6 lg:space-x-8 rtl:space-x-reverse">
               <button 
                 className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 hover:bg-pink-500 text-pink-500 hover:text-white rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg shadow-pink-500/30 border-0 focus:outline-none focus:ring-2 focus:ring-pink-400"
                 aria-label="פרופיל פייסבוק"
               >
                 <i className="fab fa-facebook-f"></i>
               </button>
               <button 
                 className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 hover:bg-pink-500 text-pink-500 hover:text-white rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg shadow-pink-500/30 border-0 focus:outline-none focus:ring-2 focus:ring-pink-400"
                 aria-label="פרופיל אינסטגרם"
               >
                 <i className="fab fa-instagram"></i>
               </button>
               <button 
                 className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 hover:bg-pink-500 text-pink-500 hover:text-white rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg shadow-pink-500/30 border-0 focus:outline-none focus:ring-2 focus:ring-pink-400"
                 aria-label="פרופיל פינטרסט"
               >
                 <i className="fab fa-pinterest"></i>
               </button>
             </div>
           </div>
        </div>
      </div>
    </>
  );
} 