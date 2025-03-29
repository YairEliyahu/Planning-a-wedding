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
      // הוספת אופציות ביצועים
      connectTimeoutMS: 10000, // הגבלת זמן חיבור ל-10 שניות
      maxPoolSize: 10, // גודל פול החיבורים המקסימלי
      minPoolSize: 5,  // גודל פול החיבורים המינימלי
      serverSelectionTimeoutMS: 5000, // זמן המתנה לבחירת שרת
      socketTimeoutMS: 45000, // זמן מקסימלי לשאילתות
    };

    console.time('mongodb-connect');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.timeEnd('mongodb-connect');
      console.log('Connected to MongoDB successfully');
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

export default connectToDatabase;

