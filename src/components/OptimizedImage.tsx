'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { ImageConfig } from '@/config/images';

interface OptimizedImageProps extends ImageConfig {
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  quality?: number;
}

/**
 * קומפוננטה אופטימלית לתמונות עם תמיכה בפורמטים מתקדמים
 * וטעינה חלקה
 */
export default function OptimizedImage({
  src,
  alt,
  priority = false,
  aspectRatio = '16/9',
  sizes = '100vw',
  className = '',
  style = {},
  onLoad,
  onError,
  loading = 'lazy',
  quality = 75,
  ...props
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // הגדרת מקורות תמונה בעדיפויות שונות
  const imageSources = {
    webp: src.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
    avif: src.replace(/\.(jpg|jpeg|png)$/i, '.avif'),
    original: src
  };

  useEffect(() => {
    // בחירת פורמט התמונה הטוב ביותר
    const selectBestFormat = async () => {
      // בדיקה אם הדפדפן תומך ב-WebP
      const supportsWebP = await checkWebPSupport();
      const supportsAvif = await checkAvifSupport();

      if (supportsAvif && imageSources.avif) {
        setCurrentSrc(imageSources.avif);
      } else if (supportsWebP && imageSources.webp) {
        setCurrentSrc(imageSources.webp);
      } else {
        setCurrentSrc(imageSources.original);
      }
    };

    selectBestFormat();
  }, [src]);

  // בדיקת תמיכה ב-WebP
  const checkWebPSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webP = new window.Image();
      webP.onload = webP.onerror = function () {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  };

  // בדיקת תמיכה ב-AVIF
  const checkAvifSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const avif = new window.Image();
      avif.onload = avif.onerror = function () {
        resolve(avif.height === 2);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  };

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    
    // נסיון עם פורמט אחר
    if (currentSrc !== imageSources.original) {
      setCurrentSrc(imageSources.original);
      setImageError(false);
    } else {
      onError?.();
    }
  };

  // אם אין מקור תמונה, החזר placeholder
  if (!currentSrc || imageError) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse ${className}`}
        style={{
          aspectRatio,
          ...style
        }}
      >
        <div className="flex items-center justify-center h-full text-gray-500">
          <svg 
            className="w-12 h-12" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio,
        ...style
      }}
    >
      {/* שכבת טעינה */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse z-10">
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* התמונה האופטימלית */}
      <Image
        src={currentSrc}
        alt={alt}
        fill
        priority={priority}
        loading={loading}
        sizes={sizes}
        quality={quality}
        className={`object-cover transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* אינדיקטור איכות תמונה */}
      {process.env.NODE_ENV === 'development' && imageLoaded && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentSrc.includes('.avif') ? 'AVIF' : 
           currentSrc.includes('.webp') ? 'WebP' : 'JPEG'}
        </div>
      )}
    </div>
  );
}

/**
 * קומפוננטה ל-slider תמונות מאופטמת
 */
interface ImageSliderProps {
  images: ImageConfig[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function OptimizedImageSlider({ 
  images, 
  autoPlay = true, 
  interval = 8000,
  className = ''
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, images.length, interval]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <OptimizedImage
            {...image}
            priority={index === 0} // רק התמונה הראשונה בעדיפות
            loading={index === 0 ? 'eager' : 'lazy'}
            className="w-full h-full"
          />
        </div>
      ))}

      {/* מחוונים */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`עבור לתמונה ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* כפתור הפסקה/הפעלה */}
      {autoPlay && images.length > 1 && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all z-20"
          aria-label={isPlaying ? 'הפסק slideshow' : 'הפעל slideshow'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      )}
    </div>
  );
} 