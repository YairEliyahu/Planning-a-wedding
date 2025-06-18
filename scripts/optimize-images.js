const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// === הגדרות אופטימיזציה ===
const OPTIMIZATION_CONFIG = {
  // גדלים סטנדרטיים
  TARGET_WIDTH: 1920,
  TARGET_HEIGHT: 1080, // יחס 16:9
  QUALITY: 75,
  
  // פורמטים
  FORMATS: {
    webp: { quality: 75, effort: 6 },
    jpeg: { quality: 80, progressive: true },
    avif: { quality: 65, effort: 4 } // פורמט עתידני
  },
  
  // תיקיות
  INPUT_DIR: 'public/images',
  OUTPUT_DIR: 'public/images/optimized',
  
  // גדלים נוספים לרספונסיב
  RESPONSIVE_SIZES: [
    { width: 768, suffix: '-mobile' },
    { width: 1024, suffix: '-tablet' },
    { width: 1920, suffix: '-desktop' }
  ]
};

// === פונקציות עזר ===

/**
 * יוצר תיקייה אם היא לא קיימת
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

/**
 * מקבל רשימת קבצי תמונות מתיקייה
 */
async function getImageFiles(directory) {
  const files = await fs.readdir(directory);
  return files.filter(file => 
    /\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i.test(file)
  );
}

/**
 * מחזיר שם קובץ נקי ללא סיומת ותווים מיוחדים
 */
function getCleanFileName(fileName) {
  return path.basename(fileName, path.extname(fileName))
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * אופטימיזציה של תמונה יחידה
 */
async function optimizeImage(inputPath, outputDir, fileName) {
  const cleanName = getCleanFileName(fileName);
  console.log(`🖼️  Processing: ${fileName} -> ${cleanName}`);
  
  try {
    // קריאת התמונה
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`   Original: ${metadata.width}x${metadata.height} (${(metadata.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // יצירת גרסאות בגדלים שונים
    for (const size of OPTIMIZATION_CONFIG.RESPONSIVE_SIZES) {
      const outputName = `${cleanName}${size.suffix}`;
      
      // חישוב גובה באופן פרופורציונלי (16:9)
      const targetHeight = Math.round(size.width * 9 / 16);
      
      // WebP (הפורמט העיקרי)
      await image
        .resize(size.width, targetHeight, { 
          fit: 'cover', 
          position: 'center'
        })
        .webp(OPTIMIZATION_CONFIG.FORMATS.webp)
        .toFile(path.join(outputDir, `${outputName}.webp`));
      
      // JPEG כגיבוי
      await image
        .resize(size.width, targetHeight, { 
          fit: 'cover', 
          position: 'center'
        })
        .jpeg(OPTIMIZATION_CONFIG.FORMATS.jpeg)
        .toFile(path.join(outputDir, `${outputName}.jpg`));
      
      console.log(`   ✅ Created: ${outputName}.webp & ${outputName}.jpg (${size.width}x${targetHeight})`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error.message);
  }
}

/**
 * פונקציה ראשית
 */
async function optimizeAllImages() {
  console.log('🚀 Starting image optimization...\n');
  
  try {
    // יצירת תיקיית פלט
    await ensureDirectory(OPTIMIZATION_CONFIG.OUTPUT_DIR);
    
    // קבלת רשימת תמונות
    const imageFiles = await getImageFiles(OPTIMIZATION_CONFIG.INPUT_DIR);
    
    if (imageFiles.length === 0) {
      console.log('❌ No image files found in input directory');
      return;
    }
    
    console.log(`📋 Found ${imageFiles.length} images to process:\n`);
    
    // עיבוד כל התמונות
    for (const file of imageFiles) {
      const inputPath = path.join(OPTIMIZATION_CONFIG.INPUT_DIR, file);
      await optimizeImage(inputPath, OPTIMIZATION_CONFIG.OUTPUT_DIR, file);
      console.log(''); // רווח בין תמונות
    }
    
    console.log('🎉 Image optimization completed successfully!');
    console.log(`📁 Optimized images saved to: ${OPTIMIZATION_CONFIG.OUTPUT_DIR}`);
    
    // הצגת סטטיסטיקות
    const optimizedFiles = await fs.readdir(OPTIMIZATION_CONFIG.OUTPUT_DIR);
    console.log(`📊 Generated ${optimizedFiles.length} optimized files`);
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
  }
}

/**
 * יצירת קובץ index אוטומטי לתמונות
 */
async function generateImageIndex() {
  console.log('📝 Generating image index...');
  
  try {
    const optimizedFiles = await fs.readdir(OPTIMIZATION_CONFIG.OUTPUT_DIR);
    const webpFiles = optimizedFiles.filter(file => file.endsWith('.webp'));
    
    // קיבוץ לפי שם בסיס
    const imageGroups = {};
    webpFiles.forEach(file => {
      const baseName = file.replace(/-(mobile|tablet|desktop)\.webp$/, '');
      if (!imageGroups[baseName]) {
        imageGroups[baseName] = [];
      }
      imageGroups[baseName].push(file);
    });
    
    // יצירת קובץ TypeScript
    const imageConfigs = Object.keys(imageGroups).map((baseName, index) => {
      return `  {
    src: '/images/optimized/${baseName}-desktop.webp',
    alt: 'תמונת חתונה ${index + 1}',
    priority: ${index === 0 ? 'true' : 'false'},
    category: 'hero' as const,
    aspectRatio: '16/9',
    sizes: '100vw'
  }`;
    }).join(',\n');
    
    const indexContent = `// === קובץ אוטומטי - נוצר על ידי optimize-images.js ===
// עודכן אוטומטית ב: ${new Date().toISOString()}

import type { ImageConfig } from './images';

export const OPTIMIZED_IMAGES: ImageConfig[] = [
${imageConfigs}
];

export default OPTIMIZED_IMAGES;
`;
    
    await fs.writeFile('src/config/optimized-images.ts', indexContent, 'utf8');
    console.log('✅ Image index generated: src/config/optimized-images.ts');
    
  } catch (error) {
    console.error('❌ Failed to generate image index:', error);
  }
}

// === הרצת הסקריפט ===
if (require.main === module) {
  (async () => {
    await optimizeAllImages();
    await generateImageIndex();
  })();
}

module.exports = {
  optimizeAllImages,
  generateImageIndex,
  OPTIMIZATION_CONFIG
}; 