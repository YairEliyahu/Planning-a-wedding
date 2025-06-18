import mongoose from 'mongoose';

// הגדרת טיפוס עבור המטמון הגלובלי
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // אם כבר יש חיבור פעיל, החזר אותו מיד
  if (cached && cached.conn) {
    return cached.conn;
  }

  // אם אין הבטחה פעילה ליצירת חיבור, צור אחת
  if (cached && !cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'WeddingApp',
      // אופטימיזציה של הגדרות ביצועים
      connectTimeoutMS: 5000, // קיצור זמן חיבור ל-5 שניות
      maxPoolSize: 20, // הגדלת גודל פול החיבורים
      minPoolSize: 5,  
      serverSelectionTimeoutMS: 3000, // קיצור זמן בחירת שרת
      socketTimeoutMS: 20000, // קיצור זמן timeout
      maxIdleTimeMS: 30000, // סגירת חיבורים לא פעילים אחרי 30 שניות
      // אופטימיזציות נוספות לביצועים
      retryWrites: true,
      w: 'majority',
      readPreference: 'primaryPreferred' as const, // קריאה מהראשי בעדיפות
      compressors: ['zlib' as const], // דחיסת נתונים
      zlibCompressionLevel: 6 as const,
      // הגדרות heartbeat מותאמות
      heartbeatFrequencyMS: 10000,
      
    };

    console.time('mongodb-connect');
    cached.promise = mongoose.connect(MONGODB_URI!, opts as mongoose.ConnectOptions).then((mongooseInstance) => {
      console.timeEnd('mongodb-connect');
      console.log('Connected to MongoDB successfully');
      
      // הגדרת אופטימיזציות נוספות
      mongoose.set('strictQuery', false);
      mongoose.set('runValidators', true);
      
      return mongooseInstance;
    });
  }

  try {
    if (cached && cached.promise) {
      cached.conn = await cached.promise;
      return cached.conn;
    }
    throw new Error('MongoDB connection promise is null');
  } catch (e) {
    if (cached) {
      cached.promise = null;
    }
    throw e;
  }
}

// אופטימיזציה של אירועי החיבור עם יותר מידע לדיבוג
mongoose.connection.on('connected', () => {
  console.log(`MongoDB connected to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.db?.databaseName || ''}`);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// הוספת מאזינים לאירועים נוספים לצורך דיבוג
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

mongoose.connection.on('timeout', () => {
  console.log('MongoDB connection timeout');
});

// ניטור ביצועים
mongoose.connection.on('slow', () => {
  console.warn('MongoDB slow operation detected');
});

export default connectToDatabase;

