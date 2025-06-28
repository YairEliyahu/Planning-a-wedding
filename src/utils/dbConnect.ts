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
  // בדיקה משופרת לחיבור קיים - בודק גם את מצב הקריאה
  if (cached && cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // אם יש חיבור אבל הוא לא מוכן, נחכה לו
  if (cached && cached.promise) {
    try {
      cached.conn = await cached.promise;
      if (mongoose.connection.readyState === 1) {
        return cached.conn;
      }
    } catch (error) {
      // אם נכשל, נאפס את ההבטחה ונתחיל מחדש
      cached.promise = null;
    }
  }

  // אם אין הבטחה פעילה ליצירת חיבור, צור אחת
  if (cached && !cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'WeddingApp',
      // אופטימיזציה של הגדרות ביצועים - הסרת אופציות לא נתמכות
      connectTimeoutMS: 10000, // חזרה לערך בטוח יותר
      maxPoolSize: 10,
      minPoolSize: 2,  
      serverSelectionTimeoutMS: 5000, // חזרה לערך בטוח יותר
      socketTimeoutMS: 20000,
      maxIdleTimeMS: 30000,
      // אופטימיזציות בסיסיות שנתמכות
      retryWrites: true,
      w: 'majority' as const,
      readPreference: 'primary' as const, // שינוי ל-primary בלבד
      // הסרת compressors שעלולים לגרום לבעיות
      // הגדרות heartbeat בסיסיות
      heartbeatFrequencyMS: 10000
    };

    console.time('mongodb-connect');
    cached.promise = mongoose.connect(MONGODB_URI!, opts as mongoose.ConnectOptions).then((mongooseInstance) => {
      console.timeEnd('mongodb-connect');
      console.log('Connected to MongoDB successfully');
      
      // הגדרת אופטימיזציות בסיסיות
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
    console.error('MongoDB connection failed:', e);
    throw e;
  }
}

// אופטימיזציה של אירועי החיבור עם יותר מידע לדיבוג
mongoose.connection.on('connected', () => {
  console.log(`MongoDB connected to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.db?.databaseName || ''}`);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  // איפוס הקאש במקרה של שגיאה
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
  // איפוס הקאש במקרה של ניתוק
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }
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

