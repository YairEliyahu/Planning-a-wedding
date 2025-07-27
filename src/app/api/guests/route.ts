import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Guest from '@/models/Guest';
import mongoose from 'mongoose';
import User from '@/models/User';



// מטמון משופר עבור רשימת אורחים עם TTL דינמי
const guestsCache = new Map<string, { 
  data: GuestType[]; 
  timestamp: number; 
  etag: string;
  count: number;
}>();
const CACHE_TTL = 2 * 60 * 1000; // 2 דקות - קצר יותר לביצועים טובים יותר
const MAX_CACHE_SIZE = 100; // הגבלת גודל המטמון

// Define a basic guest type for our use
export type GuestType = {
  _id: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  name: string;
  phoneNumber?: string;
  numberOfGuests: number;
  side: string;
  isConfirmed: boolean | null;
  notes: string;
  group?: string; // קבוצה: משפחה, עבודה, חברים, צבא וכו'
  sharedEventId?: string;
  createdAt: Date;
  updatedAt: Date;
};

// פונקציה לניקוי מטמון ישן
function cleanOldCacheEntries() {
  const now = Date.now();
  for (const [key, value] of guestsCache.entries()) {
    if (now - value.timestamp > CACHE_TTL * 2) {
      guestsCache.delete(key);
    }
  }
  
  // הגבלת גודל המטמון
  if (guestsCache.size > MAX_CACHE_SIZE) {
    const entries: Array<[string, { data: GuestType[]; timestamp: number; etag: string; count: number; }]> = [];
    for (const entry of guestsCache.entries()) {
      entries.push(entry);
    }
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // מחק את הישנים ביותר
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => guestsCache.delete(key));
  }
}

// פונקציה ליצירת ETag עבור נתונים - תיקון בעיה עם מערך ריק
function generateETag(data: GuestType[]): string {
  if (!data || data.length === 0) {
    return `"empty-${Date.now()}"`;
  }
  
  try {
    const lastModified = Math.max(...data.map(guest => 
      new Date(guest.updatedAt).getTime()
    ));
    return `"${lastModified}-${data.length}"`;
  } catch (error) {
    console.warn('[GUEST API] Error generating ETag:', error);
    return `"fallback-${Date.now()}-${data.length}"`;
  }
}

// GET /api/guests - Get all guests for the authenticated user
export async function GET(req: NextRequest) {
  console.log('[GUEST API] Starting GET request');
  
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const forceSync = req.nextUrl.searchParams.get('forceSync') === 'true';
    const clientETag = req.headers.get('if-none-match');
    
    console.log(`[GUEST API] Request params - userId: ${userId}, forceSync: ${forceSync}`);
    
    if (!userId) {
      console.error('[GUEST API] No userId provided');
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // בדיקת מטמון אם אין צורך בסנכרון כפוי
    const cacheKey = `guests-${userId}`;
    const cachedData = guestsCache.get(cacheKey);
    
    if (!forceSync && cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      console.log(`[GUEST API] Returning cached data for user ${userId}`);
      
      // בדיקת ETag לביצועים טובים יותר
      if (clientETag && clientETag === cachedData.etag) {
        return new NextResponse(null, { status: 304 }); // Not Modified
      }
      
      return NextResponse.json({
        success: true,
        guests: cachedData.data,
        cached: true,
        count: cachedData.count
      }, {
        headers: {
          'ETag': cachedData.etag,
          'Cache-Control': 'public, max-age=120'
        }
      });
    }

    // Connect to database
    console.log('[GUEST API] Connecting to database...');
    await dbConnect();

    // חיפוש משתמש עם פרויקציה מוגבלת לביצועים
    console.log(`[GUEST API] Finding user ${userId}...`);
    const user = await User.findById(userId)
      .select('sharedEventId connectedUserId')
      .lean() as {
        _id: mongoose.Types.ObjectId;
        sharedEventId?: string;
        connectedUserId?: string;
      };
      
    if (!user) {
      console.error(`[GUEST API] User ${userId} not found`);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`[GUEST API] User found - sharedEventId: ${user.sharedEventId || 'none'}`);

    let guestsResult: GuestType[] = [];
    
    if (user.sharedEventId) {
      console.log(`[GUEST API] User ${userId} using sharedEventId ${user.sharedEventId}`);
      
      // אופטימיזציה של שאילתת האורחים המשותפים
      const query = { sharedEventId: user.sharedEventId };
      
      try {
        const sharedGuests = await Guest.find(query)
          .select('name phoneNumber numberOfGuests side isConfirmed notes group userId sharedEventId updatedAt createdAt')
          .lean()
          .sort({ updatedAt: -1, name: 1 })
          .hint({ sharedEventId: 1, updatedAt: -1 }); // רמז לאינדקס
        
        console.log(`[GUEST API] Found ${sharedGuests.length} shared guests`);
        
        if (sharedGuests && sharedGuests.length > 0) {
          // המרה ישירה ללא פונקציה נוספת
          guestsResult = sharedGuests.map(guest => ({
            _id: guest._id.toString(),
            userId: guest.userId.toString(),
            name: guest.name,
            phoneNumber: guest.phoneNumber,
            numberOfGuests: guest.numberOfGuests || 1,
            side: guest.side,
            isConfirmed: guest.isConfirmed,
            notes: guest.notes || '',
            group: guest.group,
            sharedEventId: guest.sharedEventId,
            createdAt: guest.createdAt,
            updatedAt: guest.updatedAt
          }));
        }
      } catch (dbError) {
        console.error('[GUEST API] Database error for shared guests:', dbError);
        // המשך עם משתמש יחיד במקרה של שגיאה
        console.log('[GUEST API] Falling back to single user query');
      }
    }
    
    if (guestsResult.length === 0) {
      // שאילתה רגילה למשתמש יחיד או fallback
      console.log(`[GUEST API] Querying guests for single user ${userId}`);
      
      try {
        const userGuests = await Guest.find({ userId: new mongoose.Types.ObjectId(userId) })
          .lean()
          .sort({ updatedAt: -1, name: 1 })
          .hint({ userId: 1, updatedAt: -1 });
        
        console.log(`[GUEST API] Found ${userGuests.length} individual guests`);
        guestsResult = userGuests.map(guest => guest as unknown as GuestType);
      } catch (dbError) {
        console.error('[GUEST API] Database error for individual guests:', dbError);
        throw new Error('Failed to fetch guests from database');
      }
    }

    // יצירת ETag וניקוי מטמון
    const etag = generateETag(guestsResult);
    cleanOldCacheEntries();
    
    // שמירה במטמון
    guestsCache.set(cacheKey, {
      data: guestsResult,
      timestamp: Date.now(),
      etag,
      count: guestsResult.length
    });

    // בדיקת ETag שוב אחרי טעינת הנתונים
    if (clientETag && clientETag === etag) {
      return new NextResponse(null, { status: 304 });
    }

    console.log(`[GUEST API] Successfully returning ${guestsResult.length} guests for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      guests: guestsResult,
      count: guestsResult.length,
      fromCache: false
    }, {
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=120'
      }
    });

  } catch (error) {
    console.error('[GUEST API] Error fetching guests:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch guests',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/guests - Create a new guest for the authenticated user
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { userId, name, phoneNumber, numberOfGuests, side, isConfirmed, notes, group } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { message: 'User ID and guest name are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if user has a connected account
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // בדיקה האם אורח כבר קיים - מניעת כפילויות מתקדמת
    const guestName = name.trim();
    
    // בדיקה אם כבר קיים אורח עם אותו שם - כולל בחשבונות מחוברים
    let existingGuest;
    
    // אם יש שיתוף אירוע, בדוק לפי מזהה האירוע המשותף בלבד
    if (user.sharedEventId) {
      // חפש אורח עם אותו שם במזהה האירוע המשותף, ללא קשר למשתמש
      existingGuest = await Guest.findOne({
        sharedEventId: user.sharedEventId,
        name: { $regex: new RegExp(`^${guestName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } // case insensitive exact match
      });
    } else {
      // אחרת, בדוק רק לפי מזהה משתמש
      existingGuest = await Guest.findOne({
        name: { $regex: new RegExp(`^${guestName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        userId: userObjectId
      });
    }
    
    // אם האורח כבר קיים, עדכן אותו במקום ליצור חדש
    if (existingGuest) {
      console.log(`[GUEST API] Guest with name "${guestName}" already exists (ID: ${existingGuest._id}), updating instead of creating new`);
      
      // עדכון האורח הקיים
      existingGuest.phoneNumber = phoneNumber;
      existingGuest.numberOfGuests = numberOfGuests !== undefined && numberOfGuests !== null ? numberOfGuests : 1;
      existingGuest.side = side || 'משותף';
      existingGuest.isConfirmed = isConfirmed === undefined ? null : isConfirmed;
      existingGuest.notes = notes || '';
      existingGuest.group = group || '';
      existingGuest.updatedAt = new Date();
      
      // ודא שיש מזהה אירוע משותף
      if (user.sharedEventId && !existingGuest.sharedEventId) {
        existingGuest.sharedEventId = user.sharedEventId;
      }
      
      await existingGuest.save();
      
      // Clear cache for this user and any connected accounts
      const cacheKeysToDelete = [];
      for (const [key] of guestsCache.entries()) {
        if (key.includes(userId) || (user.sharedEventId && key.includes(user.sharedEventId))) {
          cacheKeysToDelete.push(key);
        }
      }
      
      cacheKeysToDelete.forEach(key => {
        console.log(`[GUEST API] Clearing cache key: ${key}`);
        guestsCache.delete(key);
      });

      return NextResponse.json({
        success: true,
        guest: existingGuest,
        updated: true
      }, { status: 200 });
    }

    // Create the guest with the current user's ID and shared event ID if available
    const guestData: {
      userId: mongoose.Types.ObjectId;
      name: string;
      phoneNumber?: string;
      numberOfGuests: number;
      side: string;
      isConfirmed: boolean | null;
      notes: string;
      group?: string;
      sharedEventId?: string;
    } = {
      userId: userObjectId,
      name: guestName,
      phoneNumber,
      numberOfGuests: numberOfGuests !== undefined && numberOfGuests !== null ? numberOfGuests : 1,
      side: side || 'משותף',
      isConfirmed: isConfirmed === undefined ? null : isConfirmed,
      notes: notes || '',
      group: group || ''
    };
    
    // ALWAYS add sharedEventId if available - this is critical for data sharing
    if (user.sharedEventId) {
      console.log(`[GUEST API] Adding shared event ID ${user.sharedEventId} to new guest`);
      guestData.sharedEventId = user.sharedEventId;
    }
    
    const guest = await Guest.create(guestData);
    console.log(`[GUEST API] Created new guest with ID ${guest._id}`);

    // Clear cache for this user and any connected accounts
    const cacheKeysToDelete = [];
    for (const [key] of guestsCache.entries()) {
      if (key.includes(userId) || (user.sharedEventId && key.includes(user.sharedEventId))) {
        cacheKeysToDelete.push(key);
      }
    }
    
    cacheKeysToDelete.forEach(key => {
      console.log(`[GUEST API] Clearing cache key: ${key}`);
      guestsCache.delete(key);
    });

    // אם יש חשבונות מחוברים - לא ליצור עותקים! 
    // האורח כבר נגיש לשני החשבונות באמצעות sharedEventId
    // זה מונע כפילויות מיותרות
    if (user.connectedUserId && user.sharedEventId) {
      console.log(`[GUEST API] Guest created with sharedEventId ${user.sharedEventId} - accessible to both connected accounts without duplication`);
    }

    return NextResponse.json({
      success: true,
      guest,
    }, { status: 201 });
  } catch (error) {
    console.error('[GUEST API] Error creating guest:', error);
    return NextResponse.json(
      { message: 'Failed to create guest' },
      { status: 500 }
    );
  }
}
