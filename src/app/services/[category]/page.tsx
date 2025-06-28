'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// מידע על קטגוריות הספקים - מיובא מהדף הראשי
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

// דוגמאות לספקים (יש למלא בספקים אמיתיים בהמשך)
const dummyVendors = {
  venues: [
    { id: 1, name: 'LAGO', location: 'ראשון לציון', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/lago.jpg', imageSource: 'אתר המקום', website: 'https://www.lago-events.co.il/' },
    { id: 2, name: 'האחוזה מודיעין', location: 'מודיעין', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/aahuza.jpg', imageSource: 'אתר המקום', website: 'https://www.haahuzah.co.il/' },
    { id: 3, name: 'EAST', location: 'תל אביב', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/east.jpg', imageSource: 'אתר המקום', website: 'https://east-tlv.co.il/' },
    { id: 4, name: 'ריברסייד', location: 'תל אביב', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/riverside.jpg', imageSource: 'אתר המקום', website: 'https://www.riverside.co.il/' },
    { id: 5, name: 'טרויה', location: 'ראשון לציון', area: 'מרכז', price: '₪₪₪', image: '/images/venues/troya.jpg', imageSource: 'אתר המקום', website: 'https://troya-garden.co.il/' },
    { id: 6, name: 'שבע', location: 'תל אביב', area: 'מרכז', price: '₪₪₪₪', image: '/images/venues/sheva.jpg', imageSource: 'אתר המקום', website: 'https://www.sheva.co.il/' },
    { id: 7, name: 'קיסר ים', location: 'קיסריה', area: 'שרון', price: '₪₪₪₪', image: '/images/venues/keisarYam.jpg', imageSource: 'אתר המקום', website: 'https://www.caesaryam.com/' },
    { id: 8, name: 'הגלריה', location: 'כפר ויתקין', area: 'שרון', price: '₪₪₪', image: '/images/venues/agaleria.jpg', imageSource: 'אתר המקום', website: 'https://gallery-event.co.il/' },
    { id: 9, name: 'גן ורדים', location: 'אבן יהודה', area: 'שרון', price: '₪₪₪', image: '/images/venues/ganVradim.jpg', imageSource: 'אתר המקום', website: 'https://www.gvradim.com/' },
    { id: 10, name: 'עלמה', location: 'תל מונד', area: 'שרון', price: '₪₪₪', image: '/images/venues/alma1.jpg', imageSource: 'אתר המקום', website: 'https://almahouse.co.il/' },
    { id: 11, name: 'Q גן אירועים', location: 'גליל ים', area: 'שרון', price: '₪₪₪₪', image: '/images/venues/Q.jpg', imageSource: 'אתר המקום', website: 'https://qce.co.il/' },
    { id: 12, name: 'אגדתא', location: 'בארותיים', area: 'שרון', price: '₪₪₪', image: '/images/venues/agadata.jpg', imageSource: 'אתר המקום', website: 'https://agadata.com/' },
    { id: 13, name: 'גני כנען', location: 'חיפה', area: 'צפון', price: '₪₪₪', image: '/images/venues/ganeCnaan.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 14, name: 'ביער', location: 'חדרה', area: 'צפון', price: '₪₪₪', image: '/images/venues/bayaar.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 15, name: 'קסיופיאה', location: 'הרצליה (חוף ים)', area: 'צפון', price: '₪₪₪₪', image: '/images/venues/ksiopia.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 16, name: 'אמארה', location: 'עפולה', area: 'צפון', price: '₪₪₪', image: '/images/venues/amara.jpg', imageSource: 'אתר המקום', website: 'https://www.amare.co.il/' },
    { id: 17, name: 'טופ דוראן', location: 'צומת כפר קרע', area: 'צפון', price: '₪₪₪', image: '/images/venues/topDoran.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 18, name: 'שמיים וארץ', location: 'כרמל', area: 'צפון', price: '₪₪₪₪', image: '/images/venues/shamaimVaaretz.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 19, name: 'חוות רונית', location: 'אזור הרי יהודה', area: 'דרום', price: '₪₪₪', image: '/images/venues/havatRonit.jpg', imageSource: 'אתר המקום', website: 'https://ronitfarm.com/' },
    { id: 20, name: 'נסיה', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/venues/nesia.jpg', imageSource: 'אתר המקום', website: 'https://nesyaevent.co.il/' },
    { id: 21, name: 'בית על הים', location: 'אשקלון', area: 'דרום', price: '₪₪₪', image: '/images/venues/baitAlAyam.jpg', imageSource: 'אתר המקום', website: 'https://www.housea.co.il/' },
    { id: 22, name: 'סופיה', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/venues/sofia.jpg', imageSource: 'אתר המקום', website: 'https://sofiaevent.co.il/' },
    { id: 23, name: 'חצר המלכה', location: 'קריית מלאכי', area: 'דרום', price: '₪₪', image: '/images/venues/hazerAmalca.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 24, name: 'אחוזת טל', location: 'אשדוד', area: 'דרום', price: '₪₪₪', image: '/images/venues/ahuzatTal.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 25, name: 'עין יעל', location: 'גן ארכיאולוגי פתוח', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/einYael.jpg', imageSource: 'אתר המקום', website: 'https://ein-yael.co.il/' },
    { id: 26, name: 'קדם', location: 'מעלה החמישה', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/kedem.jpg', imageSource: 'אתר המקום', website: 'https://www.kedem.io/' },
    { id: 27, name: 'בית הברכה', location: 'גוש עציון', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/beitAbraha.jpg', imageSource: 'אתר המקום', website: '' },
    { id: 28, name: 'ויה', location: 'ירושלים', area: 'ירושלים', price: '₪₪₪₪', image: '/images/venues/via.jpg', imageSource: 'אתר המקום', website: 'https://via-events.co.il/' },
    { id: 29, name: 'וולקאן', location: 'ירושלים', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/volkan.jpg', imageSource: 'אתר המקום', website: 'https://volcanevents.co.il/' },
    { id: 30, name: 'החצר האחורית', location: 'מושב אורה', area: 'ירושלים', price: '₪₪₪', image: '/images/venues/ahazerAahorit.jpg', imageSource: 'אתר המקום', website: 'https://www.thebackyard.co.il/' },
  ],
  photographers: [
    { id: 1, name: ' פוטו יחיאל', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/photographers/yehiel.webp' },
    { id: 2, name: 'יובל אטיאס', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/photographers/yuval.webp' },
    { id: 3, name: 'ישראל זוהרי', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/photographers/israel.webp' },
    { id: 4, name: 'סנאפ ', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/photographers/snep.webp' },
    { id: 5, name: 'אספוסה', location: 'ראשון לציון', area: 'מרכז', price: '₪₪₪₪', image: '/images/photographers/asposa.webp' },
    { id: 6, name: 'kobi ', location: 'תל אביב', area: 'מרכז', price: '₪₪', image: '/images/photographers/kobi.jpg' },
    { id: 7, name: ' parsi', location: 'ראשון לציון', area: 'מרכז', price: '₪₪', image: '/images/photographers/parsi.webp' },
    { id: 8, name: 'מור לוי', location: 'חיפה', area: 'צפון', price: '₪₪₪₪', image: '/images/photographers/mor.webp' },
    { id: 9, name: 'נדב רותם ', location: 'כרמיאל', area: 'צפון', price: '₪₪', image: '/images/photographers/nadav.webp' },
    { id: 10, name: ' כתום צלמים', location: 'חיפה', area: 'צפון', price: '₪₪', image: '/images/photographers/catom.webp' },
  ],
  catering: [
    { id: 1, name: 'קומידה', location: 'שדרות', area: 'דרום', price: '₪₪₪', image: '/images/catring/comida.webp' },
    { id: 2, name: 'פריקאצה', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/catring/pricache.webp' },
    { id: 3, name: 'הסכין והקרש', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/catring/asacin.webp' },
    { id: 4, name: 'תמרים', location: 'ראשון לציון', area: 'מרכז', price: '₪₪₪', image: '/images/catring/tmarim.webp' },
    { id: 5, name: 'המנגליסטים', location: 'רמת גן', area: 'מרכז', price: '₪₪₪₪', image: '/images/catring/amangal.webp' },
    { id: 6, name: 'מיוחד מהמטבח', location: 'בית שמש', area: 'מרכז', price: '₪₪', image: '/images/catring/meyuhad.webp' },
    { id: 7, name: 'מרינדה', location: 'רמת דוד', area: 'צפון', price: '₪₪₪', image: '/images/catring/marinda.webp' },
    { id: 8, name: 'קייטרינג גדי', location: 'כפר קיש', area: 'צפון', price: '₪₪₪₪', image: '/images/catring/gadi.webp' },
    { id: 9, name: 'קייטרינג פרידמן', location: 'מגדל העמק', area: 'צפון', price: '₪₪', image: '/images/catring/fridman.webp' },
  ],
  music: [
    { id: 1, name: 'אלירן עזרן', location: 'באר שבע', area: 'דרום', price: '₪₪₪', image: '/images/dj/eliran.webp' },
    { id: 2, name: 'MA EVENT', location: 'באר שבע', area: 'דרום', price: '₪₪₪₪', image: '/images/dj/ma.webp' },
    { id: 3, name: 'RED MUSIC', location: 'באר שבע', area: 'דרום', price: '₪₪', image: '/images/dj/red.webp' },
    { id: 4, name: 'רז מועלמי', location: 'חולון', area: 'מרכז', price: '₪₪₪', image: '/images/dj/raz.webp' },
    { id: 5, name: 'ליאור אילק', location: 'ירושלים', area: 'מרכז', price: '₪₪₪₪', image: '/images/dj/lior.webp' },
    { id: 6, name: 'שרון כהן', location: 'רמת גן', area: 'מרכז', price: '₪₪', image: '/images/dj/sharon.webp' },
    { id: 7, name: 'איתן כרמי', location: 'טירת כרמל', area: 'צפון', price: '₪₪₪', image: '/images/dj/eitan.jpg' },
    { id: 8, name: 'DJ DINO', location: 'נשר', area: 'צפון', price: '₪₪₪₪', image: '/images/dj/dino.webp' },
    { id: 9, name: 'פפריקה', location: 'חיפה', area: 'צפון', price: '₪₪', image: '/images/dj/paprica.webp' },
  ],
  dresses: [
    { id: 1, name: 'סטודיו לשמלות כלה', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪', image: '/images/dummy/dress1.jpg' },
    { id: 2, name: 'אופנת כלות', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/dummy/dress2.jpg' },
    { id: 3, name: 'שמלות כלה יוקרה', location: 'אזור הצפון', area: 'צפון', price: '₪₪', image: '/images/dummy/dress3.jpg' },
  ],
  jewelry: [
    { id: 1, name: 'תכשיטי פאר', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪', image: '/images/dummy/jewelry1.jpg' },
    { id: 2, name: 'זהב ויהלומים', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/dummy/jewelry2.jpg' },
    { id: 3, name: 'עיצוב תכשיטים', location: 'אזור הצפון', area: 'צפון', price: '₪₪', image: '/images/dummy/jewelry3.jpg' },
  ],
  flowers: [
    { id: 1, name: 'משתלת הפרחים', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪', image: '/images/dummy/flower1.jpg' },
    { id: 2, name: 'פרחי האהבה', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/dummy/flower2.jpg' },
    { id: 3, name: 'עיצוב אירועים', location: 'אזור הצפון', area: 'צפון', price: '₪₪', image: '/images/dummy/flower3.jpg' },
  ],
  makeup: [
    { id: 1, name: 'מאפרת הכלות', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪', image: '/images/dummy/makeup1.jpg' },
    { id: 2, name: 'סטודיו לאיפור ושיער', location: 'אזור המרכז', area: 'מרכז', price: '₪₪₪₪', image: '/images/dummy/makeup2.jpg' },
    { id: 3, name: 'איפור כלות', location: 'אזור הצפון', area: 'צפון', price: '₪₪', image: '/images/dummy/makeup3.jpg' },
  ],
};

interface Vendor {
  id: number;
  name: string;
  location: string;
  price: string;
  image: string;
  area: string;
  imageSource?: string;
  website?: string;
}

interface Params {
  params: {
    category: string;
  };
}

export default function CategoryPage({ params }: Params) {
  const router = useRouter();
  const { category } = params;
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [areaFilter, setAreaFilter] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('popularity');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const vendorsPerPage = 15;

  // מוצא את הקטגוריה הנוכחית לפי המזהה
  useEffect(() => {
    const foundCategory = serviceCategories.find(cat => cat.id === category);
    if (foundCategory) {
      setCurrentCategory(foundCategory);
      // בשלב זה נשתמש בספקי דמה - בהמשך יוחלף במידע אמיתי מהשרת
      const categoryVendors = dummyVendors[category as keyof typeof dummyVendors] || [];
      setVendors(categoryVendors);
      setFilteredVendors(categoryVendors);
    } else {
      // אם הקטגוריה לא נמצאה, מעביר בחזרה לדף הספקים הראשי
      router.push('/services');
    }
  }, [category, router]);

  // מפעיל סינון כאשר משתנים הפילטרים
  useEffect(() => {
    let result = [...vendors];
    
    // סינון לפי אזור
    if (areaFilter) {
      result = result.filter(vendor => {
        if (areaFilter === 'center') return vendor.area === 'מרכז';
        if (areaFilter === 'north') return vendor.area === 'צפון';
        if (areaFilter === 'south') return vendor.area === 'דרום';
        if (areaFilter === 'sharon') return vendor.area === 'שרון';
        if (areaFilter === 'jerusalem') return vendor.area === 'ירושלים';
        return true;
      });
    }
    
    // סינון לפי מחיר
    if (priceFilter) {
      result = result.filter(vendor => {
        if (priceFilter === 'low') return vendor.price === '₪' || vendor.price === '₪₪';
        if (priceFilter === 'medium') return vendor.price === '₪₪' || vendor.price === '₪₪₪';
        if (priceFilter === 'high') return vendor.price === '₪₪₪₪';
        return true;
      });
    }
    
    // מיון התוצאות
    if (sortOption === 'price_low') {
      result.sort((a, b) => a.price.length - b.price.length);
    } else if (sortOption === 'price_high') {
      result.sort((a, b) => b.price.length - a.price.length);
    }
    
    setFilteredVendors(result);
  }, [vendors, areaFilter, priceFilter, sortOption]);

  // חישוב מספר עמודים ופיצול הספקים לפי העמוד הנוכחי
  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);
  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstVendor, indexOfLastVendor);

  // מעבר לעמוד הראשון כאשר משתנים הסינונים
  useEffect(() => {
    setCurrentPage(1);
  }, [areaFilter, priceFilter, sortOption]);

  // פונקציה למעבר לעמוד מסוים
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // יצירת מערך של מספרי עמודים לתצוגה
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // אם אין קטגוריה או ספקים, מציג טעינה
  if (!currentCategory || vendors.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>טוען ספקים...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{...styles.header, backgroundColor: currentCategory.bgColor}}>
        <Link href="/services" style={styles.backLink}>
          <i className="fas fa-arrow-right"></i> חזרה לכל הקטגוריות
        </Link>
        <h1 style={styles.title}>{currentCategory.title}</h1>
        <div style={{...styles.titleDecoration, background: `linear-gradient(90deg, ${currentCategory.iconColor}, ${currentCategory.iconColor}cc)`}}></div>
        <p style={styles.headerText}>
          {currentCategory.description}
        </p>
      </div>
      
      <div style={styles.filtersSection}>
        <div style={styles.filterContainer}>
          <label style={styles.filterLabel}>סנן לפי:</label>
          <select 
            style={styles.filterSelect}
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="">כל המיקומים</option>
            <option value="center">אזור המרכז</option>
            <option value="north">אזור הצפון</option>
            <option value="south">אזור הדרום</option>
            <option value="sharon">אזור השרון</option>
            <option value="jerusalem">אזור ירושלים</option>
          </select>
          
          <select 
            style={styles.filterSelect}
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="">כל טווחי המחירים</option>
            <option value="low">מחיר נמוך (₪)</option>
            <option value="medium">מחיר בינוני (₪₪-₪₪₪)</option>
            <option value="high">מחיר גבוה (₪₪₪₪)</option>
          </select>
        </div>
        
        <div style={styles.sortContainer}>
          <label style={styles.filterLabel}>מיון:</label>
          <select 
            style={styles.filterSelect}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="popularity">פופולריות</option>
            <option value="price_low">מחיר - מהנמוך לגבוה</option>
            <option value="price_high">מחיר - מהגבוה לנמוך</option>
            <option value="rating">דירוג</option>
          </select>
        </div>
      </div>
      
      <div style={styles.vendorsGrid}>
        {filteredVendors.length > 0 ? currentVendors.map((vendor) => (
          <motion.div
            key={vendor.id}
            style={styles.vendorCard}
            whileHover={{ 
              y: -10,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={styles.vendorImageContainer}>
              <div 
                style={{
                  ...styles.vendorImage,
                  backgroundImage: `url(${vendor.image})`,
                }}
              >
                <div style={styles.imageBackground}></div>
                {vendor.imageSource && (
                  <div style={styles.imageSourceTag}>
                    <span>{vendor.imageSource}</span>
                  </div>
                )}
                <div style={styles.vendorInfo}>
                  <h3 style={styles.vendorName}>{vendor.name}</h3>
                  <p style={styles.vendorDetails}>
                    <span style={styles.vendorLocation}>
                      <i className="fas fa-map-marker-alt" style={styles.vendorIcon}></i> {vendor.location}
                    </span>
                    <span style={styles.vendorPrice}>
                      <i className="fas fa-shekel-sign" style={styles.vendorIcon}></i> {vendor.price}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div style={styles.vendorActions}>
              <button style={styles.viewDetailsButton}>
                <i className="fas fa-info-circle"></i> פרטים נוספים
              </button>
              <button style={{...styles.contactVendorButton, backgroundColor: currentCategory.iconColor}}>
                <i className="fas fa-phone-alt"></i> יצירת קשר
              </button>
            </div>
            
            {vendor.website && (
              <div style={styles.websiteButtonContainer}>
                <a 
                  href={vendor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.websiteButton}
                >
                  <i className="fas fa-globe"></i> לאתר הרשמי
                </a>
              </div>
            )}
          </motion.div>
        )) : (
          <div style={styles.noResults}>
            <i className="fas fa-search" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
            <p>לא נמצאו תוצאות התואמות את החיפוש שלך</p>
            <button 
              style={styles.resetFiltersButton}
              onClick={() => {
                setAreaFilter('');
                setPriceFilter('');
                setSortOption('popularity');
              }}
            >
              נקה סינון
            </button>
          </div>
        )}
      </div>
      
      {filteredVendors.length > 0 && totalPages > 1 && (
        <div style={styles.pagination}>
          <button 
            style={styles.paginationButton}
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
          
          {/* תצוגת מספרי עמודים */}
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              style={number === currentPage ? styles.paginationCurrent : styles.paginationButton}
            >
              {number}
            </button>
          ))}
          
          <button 
            style={styles.paginationButton}
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      )}
      
      {/* אינדיקציה למספר הספקים המוצגים */}
      {filteredVendors.length > 0 && (
        <div style={styles.resultsInfo}>
          מציג {indexOfFirstVendor + 1}-{Math.min(indexOfLastVendor, filteredVendors.length)} מתוך {filteredVendors.length} ספקים
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '100px auto 50px',
    padding: '0 2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  loadingSpinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTop: '4px solid #ff4081',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  header: {
    padding: '3rem 2rem',
    borderRadius: '16px',
    marginBottom: '2rem',
    position: 'relative' as const,
    textAlign: 'center' as const,
  },
  backLink: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    color: '#333',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'color 0.3s ease',
    ':hover': {
      color: '#ff4081',
    }
  },
  title: {
    fontSize: '3rem',
    color: '#333',
    marginBottom: '1rem',
    fontFamily: 'var(--font-shrikhand), cursive',
  },
  titleDecoration: {
    width: '80px',
    height: '4px',
    margin: '0 auto 1.5rem',
    borderRadius: '2px',
  },
  headerText: {
    fontSize: '1.2rem',
    maxWidth: '700px',
    margin: '0 auto',
    color: '#666',
  },
  filtersSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem 0',
    borderBottom: '1px solid #eee',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  filterLabel: {
    fontWeight: '600',
    color: '#334',
  },
  filterSelect: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#333',
    minWidth: '150px',
  },
  vendorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
    padding: '1rem 0 3rem',
  },
  vendorCard: {
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
  },
  vendorImageContainer: {
    height: '200px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  vendorImage: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: 'url(/images/dummy/placeholder.jpg)',
  },
  imageBackground: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '70%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
  },
  vendorInfo: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    padding: '1rem',
    color: 'white',
  },
  vendorName: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
  },
  vendorDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
  vendorLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  vendorPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  vendorIcon: {
    fontSize: '0.9rem',
  },
  vendorActions: {
    display: 'flex',
    padding: '1rem',
    borderTop: '1px solid #eee',
    gap: '0.5rem',
  },
  viewDetailsButton: {
    flex: 1,
    padding: '0.6rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#e0e0e0',
    }
  },
  contactVendorButton: {
    flex: 1,
    padding: '0.6rem',
    backgroundColor: '#ff4081',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    ':hover': {
      opacity: 0.9,
    }
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '2rem',
    marginBottom: '3rem',
  },
  paginationButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#333',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    }
  },
  paginationCurrent: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ff4081',
    borderRadius: '4px',
    backgroundColor: '#ff4081',
    color: 'white',
    fontWeight: '600',
  },
  noResults: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center' as const,
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
  },
  resetFiltersButton: {
    marginTop: '1rem',
    padding: '0.6rem 2rem',
    backgroundColor: '#ff4081',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#e0336d',
    }
  },
  resultsInfo: {
    textAlign: 'center' as const,
    color: '#666',
    marginTop: '0.5rem',
    marginBottom: '2rem',
    fontSize: '0.9rem',
  },
  imageSourceTag: {
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    zIndex: 2,
  },
  websiteButtonContainer: {
    padding: '0 1rem 1rem',
    borderTop: '1px solid #eee',
  },
  websiteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    textDecoration: 'none',
    cursor: 'pointer',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    ':hover': {
      backgroundColor: '#c8e6c9',
    }
  },
}; 