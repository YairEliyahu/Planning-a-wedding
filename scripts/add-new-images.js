const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// === הגדרות ===
const CONFIG = {
  INPUT_DIR: '', // יוגדר על ידי המשתמש
  EXISTING_DIR: 'public/images',
  OUTPUT_DIR: 'public/images',
  OPTIMIZED_DIR: 'public/images/optimized',
  
  // סוגי קבצים נתמכים
  SUPPORTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
  
  // הגדרות השוואה
  SIMILARITY_THRESHOLD: 0.95, // רמת דמיון לזיהוי כפילויות
  MAX_HASH_SIZE: 16, // גודל hash לזיהוי מהיר
};

// === פונקציות עזר ===

/**
 * יוצר hash של תמונה לזיהוי כפילויות
 */
async function generateImageHash(imagePath) {
  try {
    const buffer = await sharp(imagePath)
      .resize(CONFIG.MAX_HASH_SIZE, CONFIG.MAX_HASH_SIZE, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer();
    
    return crypto.createHash('md5').update(buffer).digest('hex');
  } catch (error) {
    console.warn(`⚠️  Cannot hash ${imagePath}: ${error.message}`);
    return null;
  }
}

/**
 * יוצר hash מהיר על פי גודל וזמן יצירה
 */
async function generateQuickHash(imagePath) {
  try {
    const stats = await fs.stat(imagePath);
    const content = `${stats.size}-${stats.mtime.getTime()}`;
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  } catch (error) {
    return null;
  }
}

/**
 * בודק אם קובץ הוא תמונה נתמכת
 */
function isImageFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return CONFIG.SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * מקבל רשימת תמונות מתיקייה
 */
async function getImageFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    return files.filter(isImageFile);
  } catch (error) {
    console.error(`❌ Cannot read directory ${directory}: ${error.message}`);
    return [];
  }
}

/**
 * יוצר שם קובץ ייחודי
 */
function generateUniqueFileName(originalName, existingFiles) {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  let counter = 1;
  let newName = originalName;
  
  while (existingFiles.includes(newName)) {
    newName = `${baseName}-${counter}${ext}`;
    counter++;
  }
  
  return newName;
}

/**
 * מנקה שם קובץ מתווים לא חוקיים
 */
function sanitizeFileName(fileName) {
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  
  const clean = baseName
    .replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '-') // עברית ואנגלית + מספרים
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  
  return clean + ext;
}

/**
 * מעתיק קובץ תמונה חדש
 */
async function copyNewImage(sourcePath, fileName, existingFiles) {
  try {
    const cleanName = sanitizeFileName(fileName);
    const uniqueName = generateUniqueFileName(cleanName, existingFiles);
    const targetPath = path.join(CONFIG.OUTPUT_DIR, uniqueName);
    
    await fs.copyFile(sourcePath, targetPath);
    console.log(`  ✅ Added: ${fileName} → ${uniqueName}`);
    
    return uniqueName;
  } catch (error) {
    console.error(`  ❌ Failed to copy ${fileName}: ${error.message}`);
    return null;
  }
}

/**
 * פונקציה ראשית - מוספת תמונות חדשות
 */
async function addNewImages(inputDirectory) {
  console.log('🚀 Starting smart image import...\n');
  
  if (!inputDirectory) {
    console.error('❌ Please provide input directory path');
    console.log('Usage: node scripts/add-new-images.js /path/to/your/images');
    return;
  }
  
  CONFIG.INPUT_DIR = inputDirectory;
  
  try {
    // בדיקת תיקיות
    await fs.access(CONFIG.INPUT_DIR);
    await fs.access(CONFIG.EXISTING_DIR);
  } catch (error) {
    console.error(`❌ Directory not found: ${error.message}`);
    return;
  }
  
  console.log(`📁 Scanning: ${CONFIG.INPUT_DIR}`);
  console.log(`📁 Existing: ${CONFIG.EXISTING_DIR}\n`);
  
  // קבלת רשימת תמונות
  const newImages = await getImageFiles(CONFIG.INPUT_DIR);
  const existingImages = await getImageFiles(CONFIG.EXISTING_DIR);
  
  if (newImages.length === 0) {
    console.log('❌ No image files found in input directory');
    return;
  }
  
  console.log(`📋 Found ${newImages.length} new images to process`);
  console.log(`📋 ${existingImages.length} existing images in library\n`);
  
  // יצירת maps של hashes לזיהוי כפילויות
  console.log('🔍 Building image fingerprints...');
  const existingHashes = new Map();
  const existingQuickHashes = new Set();
  
  // בניית hash למאגר הקיים
  for (const fileName of existingImages) {
    const filePath = path.join(CONFIG.EXISTING_DIR, fileName);
    const quickHash = await generateQuickHash(filePath);
    const imageHash = await generateImageHash(filePath);
    
    if (quickHash) existingQuickHashes.add(quickHash);
    if (imageHash) existingHashes.set(imageHash, fileName);
  }
  
  console.log(`✅ Analyzed ${existingHashes.size} existing images\n`);
  
  // עיבוד תמונות חדשות
  const results = {
    added: [],
    duplicates: [],
    errors: []
  };
  
  console.log('🎯 Processing new images:');
  
  for (const fileName of newImages) {
    const sourcePath = path.join(CONFIG.INPUT_DIR, fileName);
    
    console.log(`\n🖼️  Processing: ${fileName}`);
    
    // בדיקה מהירה - גודל ותאריך
    const quickHash = await generateQuickHash(sourcePath);
    if (quickHash && existingQuickHashes.has(quickHash)) {
      console.log('  ⏭️  Skipped: Identical file already exists');
      results.duplicates.push(fileName);
      continue;
    }
    
    // בדיקה מתקדמת - תוכן התמונה
    const imageHash = await generateImageHash(sourcePath);
    if (imageHash && existingHashes.has(imageHash)) {
      console.log(`  ⏭️  Skipped: Similar image exists (${existingHashes.get(imageHash)})`);
      results.duplicates.push(fileName);
      continue;
    }
    
    // העתקת התמונה החדשה
    const newFileName = await copyNewImage(sourcePath, fileName, existingImages);
    if (newFileName) {
      results.added.push(newFileName);
      existingImages.push(newFileName); // מניעת כפילות בתוך אותה הפעלה
      
      // עדכון hash maps
      if (quickHash) existingQuickHashes.add(quickHash);
      if (imageHash) existingHashes.set(imageHash, newFileName);
    } else {
      results.errors.push(fileName);
    }
  }
  
  // סיכום תוצאות
  console.log('\n🎉 Import completed!\n');
  console.log('📊 Results:');
  console.log(`  ✅ Added: ${results.added.length} new images`);
  console.log(`  ⏭️  Skipped: ${results.duplicates.length} duplicates`);
  console.log(`  ❌ Errors: ${results.errors.length} failed`);
  
  if (results.added.length > 0) {
    console.log('\n🚀 Running optimization on new images...');
    // ייבוא ושימוש בסקריפט הקיים
    const { optimizeAllImages, generateImageIndex } = require('./optimize-images.js');
    await optimizeAllImages();
    await generateImageIndex();
    
    console.log('\n✨ New images are ready to use!');
    console.log('📝 Updated files:');
    console.log('  - public/images/optimized/ (new optimized images)');
    console.log('  - src/config/optimized-images.ts (updated index)');
  }
  
  if (results.duplicates.length > 0) {
    console.log('\n📋 Skipped duplicates:');
    results.duplicates.forEach(name => console.log(`  - ${name}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed files:');
    results.errors.forEach(name => console.log(`  - ${name}`));
  }
}

// === הפעלת הסקריפט ===
if (require.main === module) {
  const inputDir = process.argv[2];
  addNewImages(inputDir);
}

module.exports = { addNewImages }; 