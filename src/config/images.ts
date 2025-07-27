// === מערכת ניהול תמונות מרכזית ===

export interface ImageConfig {
  src: string;
  alt: string;
  priority?: boolean;
  category?: 'hero' | 'gallery' | 'background';
  aspectRatio?: string;
  sizes?: string;
}

// === הגדרות אופטימיזציה לתמונות ===
export const IMAGE_OPTIMIZATION = {
  // גדלים סטנדרטיים לתמונות רקע
  BACKGROUND_SIZES: {
    mobile: 768,
    tablet: 1024,
    desktop: 1920,
    quality: 75, // איזון בין איכות לגודל קובץ
  },
  
  // יחס גובה-רוחב אחיד לכל התמונות
  ASPECT_RATIO: '16/9', // פורמט מלבני סטנדרטי
  
  // הגדרות לטעינה עצלה
  LAZY_LOADING: {
    threshold: '50px', // מתי להתחיל לטעון
    rootMargin: '50px', // שולי טעינה
  }
} as const;

// === תמונות רקע עיקריות ===
export const HERO_BACKGROUND_IMAGES: ImageConfig[] = [
  {
    src: '/images/optimized/wedding-hero-1.webp',
    alt: 'זוג חתנים במעמד חתונה רומנטי',
    priority: true,
    category: 'hero',
    aspectRatio: IMAGE_OPTIMIZATION.ASPECT_RATIO,
    sizes: '100vw'
  },
  {
    src: '/images/optimized/wedding-hero-2.webp',
    alt: 'חתונה באולם יפיפה עם פרחים',
    category: 'hero',
    aspectRatio: IMAGE_OPTIMIZATION.ASPECT_RATIO,
    sizes: '100vw'
  },
  {
    src: '/images/optimized/wedding-hero-3.webp',
    alt: 'רגע מיוחד בחתונה',
    category: 'hero',
    aspectRatio: IMAGE_OPTIMIZATION.ASPECT_RATIO,
    sizes: '100vw'
  },
  {
    src: '/images/optimized/wedding-hero-4.webp',
    alt: 'חגיגת חתונה מרהיבה',
    category: 'hero',
    aspectRatio: IMAGE_OPTIMIZATION.ASPECT_RATIO,
    sizes: '100vw'
  },
  {
    src: '/images/optimized/wedding-hero-5.webp',
    alt: 'זוג מאושר ביום החתונה',
    category: 'hero',
    aspectRatio: IMAGE_OPTIMIZATION.ASPECT_RATIO,
    sizes: '100vw'
  }
];

// === תמונות גלריה נוספות ===
export const GALLERY_IMAGES: ImageConfig[] = [
  {
    src: '/images/optimized/gallery-1.webp',
    alt: 'רגע מיוחד מחתונה',
    category: 'gallery',
    aspectRatio: IMAGE_OPTIMIZATION.ASPECT_RATIO,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  },
  // ניתן להוסיף עוד תמונות כאן בקלות
];

// === פונקציות עזר ===

/**
 * מחזיר מערך תמונות מעורבב באופן אקראי
 */
export function getShuffledImages(images: ImageConfig[] = HERO_BACKGROUND_IMAGES): ImageConfig[] {
  const shuffled = [...images];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * מחזיר תמונות לפי קטגוריה
 */
export function getImagesByCategory(category: ImageConfig['category']): ImageConfig[] {
  return HERO_BACKGROUND_IMAGES.filter(img => img.category === category);
}

/**
 * מחזיר URL אופטימלי לתמונה על פי גודל המכשיר
 */
export function getOptimizedImageUrl(
  src: string, 
  width: number = IMAGE_OPTIMIZATION.BACKGROUND_SIZES.desktop,
  quality: number = IMAGE_OPTIMIZATION.BACKGROUND_SIZES.quality
): string {
  // אם זה Next.js Image Optimization
  if (src.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
  }
  return src;
}

/**
 * טוען תמונה באופן אסינכרוני עם timeout
 */
export function preloadImage(src: string, timeout: number = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      reject(new Error(`Image load timeout: ${src}`));
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timer);
      resolve(src);
    };
    
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
}

/**
 * טוען מערך תמונות עם הגבלת מספר בקשות בו-זמניות
 */
export async function preloadImagesWithLimit(
  images: ImageConfig[], 
  concurrentLimit: number = 3
): Promise<{ loaded: string[]; failed: string[] }> {
  const loaded: string[] = [];
  const failed: string[] = [];
  
  // חלוקה לאצוות
  for (let i = 0; i < images.length; i += concurrentLimit) {
    const batch = images.slice(i, i + concurrentLimit);
    const promises = batch.map(img => 
      preloadImage(img.src)
        .then(src => loaded.push(src))
        .catch(() => failed.push(img.src))
    );
    
    await Promise.allSettled(promises);
  }
  
  return { loaded, failed };
}

// === ייצוא של כל התמונות לשימוש קל ===
export const ALL_IMAGES = {
  hero: HERO_BACKGROUND_IMAGES,
  gallery: GALLERY_IMAGES,
} as const;

// === נתיבים פשוטים למיגרציה ===
export const LEGACY_IMAGE_PATHS = [
  '/images/wedding-background.jpg',
  '/images/311691308_10223945859767494_4494901931895656765_n.jpg',
  '/images/430853596_10226981026324761_6445618788012733513_n.jpg',
  '/images/475104690_10229871826952970_7379256486698947066_n.jpg',
  '/images/475280938_10229871827872993_8154661980827464805_n.jpg',
];

export default {
  HERO_BACKGROUND_IMAGES,
  GALLERY_IMAGES,
  ALL_IMAGES,
  getShuffledImages,
  getImagesByCategory,
  getOptimizedImageUrl,
  preloadImage,
  preloadImagesWithLimit,
  IMAGE_OPTIMIZATION,
}; 