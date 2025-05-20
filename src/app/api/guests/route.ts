import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Guest from '@/models/Guest';
import mongoose from 'mongoose';
import User from '@/models/User';

// מטמון עבור חיבור למסד הנתונים
let dbConnection: mongoose.Connection | null = null;

// מטמון עבור רשימת אורחים
const guestsCache = new Map<string, { data: GuestType[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 דקות

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
  sharedEventId?: string;
  createdAt: Date;
  updatedAt: Date;
};

// GET /api/guests - Get all guests for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Get the user ID from the query parameters
    const userId = req.nextUrl.searchParams.get('userId');
    // בדיקה האם סנכרון כפוי נדרש
    const forceSync = req.nextUrl.searchParams.get('forceSync') === 'true';
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // בדיקת מטמון אם אין צורך בסנכרון כפוי
    if (!forceSync) {
      const cachedGuests = guestsCache.get(userId);
      if (cachedGuests && Date.now() - cachedGuests.timestamp < CACHE_TTL) {
        return NextResponse.json({
          success: true,
          guests: cachedGuests.data
        });
      }
    }

    // Connect to the database with caching
    if (!dbConnection) {
      await dbConnect();
      dbConnection = mongoose.connection;
    }

    // First, check if user has a connected account
    const user = await User.findById(userId).lean() as {
      _id: mongoose.Types.ObjectId;
      sharedEventId?: string;
      connectedUserId?: string;
    };
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Using GuestType[] for our result
    let guestsResult: GuestType[] = [];
    
    // If user has a sharedEventId, query guests using that ID to get all guests for both accounts
    if (user.sharedEventId) {
      console.log(`[GUEST API] User ${userId} has sharedEventId ${user.sharedEventId}, finding all shared guests`);
      
      // אם דרוש סנכרון כפוי, יש לבצע סנכרון חד פעמי עם מנגנון מיוחד שימנע כפילויות
      if (forceSync && user.connectedUserId) {
        console.log('[GUEST API] Force sync requested - performing one-time full sync');
        try {
          // חשוב: נשתמש במזהה המשותף לשניהם ונמנע מלהעתיק את האורחים פעמיים
          
          // 1. מצא את כל האורחים המשותפים לפי ID האירוע המשותף
          // כל האורחים כבר נמצאים בדטאבייס, אבל אנחנו רוצים לאחד את הכפילויות
          const sharedGuests = await Guest.find({ sharedEventId: user.sharedEventId }).lean();
          
          // 2. צור מפה של אורחים ייחודיים לפי שם (מפתח ראשי)
          const uniqueGuests = new Map<string, {
            latestGuest: GuestType;
            instances: string[];
            users: string[];
          }>();
          
          // מעבר ראשון - אחד את כל האורחים לפי השם שלהם וזהה את האורח העדכני ביותר
          for (const guest of sharedGuests) {
            const typedGuest = guest as unknown as GuestType;
            const guestName = typedGuest.name.trim();
            
            if (!uniqueGuests.has(guestName)) {
              uniqueGuests.set(guestName, {
                latestGuest: typedGuest,
                instances: [typedGuest._id.toString()],
                users: [typedGuest.userId.toString()]
              });
            } else {
              const existingEntry = uniqueGuests.get(guestName)!;
              
              // הוסף את מזהה האורח למערך המזהים
              existingEntry.instances.push(typedGuest._id.toString());
              
              // הוסף את מזהה המשתמש למערך המשתמשים אם הוא לא קיים כבר
              if (!existingEntry.users.includes(typedGuest.userId.toString())) {
                existingEntry.users.push(typedGuest.userId.toString());
              }
              
              // בדוק אם זה האורח העדכני ביותר
              if (typedGuest.updatedAt > existingEntry.latestGuest.updatedAt) {
                existingEntry.latestGuest = typedGuest;
              }
            }
          }
          
          console.log(`[GUEST API] Found ${uniqueGuests.size} unique guests from ${sharedGuests.length} total entries`);
          
          // מחק את כל האורחים הכפולים ושמור רק את האורח העדכני ביותר מכל שם
          for (const [guestName, entry] of Array.from(uniqueGuests.entries())) {
            // אם יש יותר ממופע אחד של האורח (כלומר יש כפילות)
            if (entry.instances.length > 1) {
              // שמור את המזהה של האורח העדכני ביותר
              const latestGuestId = entry.latestGuest._id.toString();
              
              // מחק את כל המופעים האחרים (הכפולים) של האורח
              for (const instanceId of entry.instances) {
                if (instanceId !== latestGuestId) {
                  await Guest.findByIdAndDelete(instanceId);
                  console.log(`[GUEST API] Deleted duplicate guest: ${guestName} (ID: ${instanceId})`);
                }
              }
              
              // עדכן את האורח הנותר כך שיהיה משויך לאירוע המשותף
              await Guest.findByIdAndUpdate(latestGuestId, {
                sharedEventId: user.sharedEventId
              });
            }
          }
          
          console.log('[GUEST API] Completed cleanup of duplicate guests');
        } catch (error) {
          console.error('[GUEST API] Error during force sync cleanup:', error);
        }
      }
      
      // כעת קבל את כל האורחים המשותפים (אחרי הסנכרון והניקוי)
      // פשוט השתמש ב-sharedEventId לקבלת כל האורחים
      const sharedGuests = await Guest.find({ sharedEventId: user.sharedEventId })
        .lean()
        .sort({ updatedAt: -1 }); // מיון לפי תאריך עדכון אחרון
      
      console.log(`[GUEST API] Found ${sharedGuests.length} guests with sharedEventId ${user.sharedEventId}`);
      
      // Use the specialized organizing method with the shared guests
      if (sharedGuests && sharedGuests.length > 0) {
        // Type assertion to bypass strict type checking
        // @ts-expect-error - Mongoose type compatibility issues
        const result = await Guest.getOrganizedGuestList(userId, sharedGuests);
        
        // התוצאה מכילה מבנה מורכב, נחלץ את המערך של האורחים
        if (result && result.sides) {
          // @ts-expect-error - Type compatibility issues with Mongoose documents
          guestsResult = [
            ...(result.sides['חתן'] || []),
            ...(result.sides['כלה'] || []),
            ...(result.sides['משותף'] || [])
          ];
        }
      } else {
        // FALLBACK: If no guests found by sharedEventId, try finding by userIds
        console.log('[GUEST API] No guests found by sharedEventId, trying to find by userIds');
        const userIds = [userId];
        if (user.connectedUserId) {
          userIds.push(user.connectedUserId);
        }
        
        const guestsByUserId = await Guest.find({ 
          userId: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } 
        })
        .lean()
        .sort({ updatedAt: -1 }); // מיון לפי תאריך עדכון אחרון
        
        console.log(`[GUEST API] Found ${guestsByUserId.length} guests by userIds`);
        
        // Update all found guests to include the sharedEventId
        if (guestsByUserId.length > 0) {
          for (const guest of guestsByUserId) {
            const typedGuest = guest as unknown as GuestType;
            if (!typedGuest.sharedEventId) {
              await Guest.findByIdAndUpdate(typedGuest._id, { sharedEventId: user.sharedEventId });
            }
          }
          
          // Use the specialized organizing method
          // @ts-expect-error - Mongoose type compatibility issues
          const result = await Guest.getOrganizedGuestList(userId, guestsByUserId);
          
          // התוצאה מכילה מבנה מורכב, נחלץ את המערך של האורחים
          if (result && result.sides) {
            // @ts-expect-error - Type compatibility issues with Mongoose documents
            guestsResult = [
              ...(result.sides['חתן'] || []),
              ...(result.sides['כלה'] || []),
              ...(result.sides['משותף'] || [])
            ];
          }
        }
      }
    } else {
      // Fallback: get guests only for this specific user
      const userGuests = await Guest.find({ userId: new mongoose.Types.ObjectId(userId) })
        .lean()
        .sort({ updatedAt: -1 }); // מיון לפי תאריך עדכון אחרון
      
      console.log(`[GUEST API] Fallback: Found ${userGuests.length} guests for user ${userId}`);
      
      // נחזיר ישירות את המערך של האורחים
      guestsResult = userGuests as unknown as GuestType[];
    }

    // שמירה במטמון
    guestsCache.set(userId, {
      data: guestsResult,
      timestamp: Date.now()
    });

    return NextResponse.json({
      success: true,
      guests: guestsResult
    });
  } catch (error) {
    console.error('[GUEST API] Error fetching guests:', error);
    return NextResponse.json(
      { message: 'Failed to fetch guests', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/guests - Create a new guest for the authenticated user
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { userId, name, phoneNumber, numberOfGuests, side, isConfirmed, notes } = body;

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

    // בדיקה האם אורח כבר קיים - מניעת כפילויות
    const guestName = name.trim();
    
    // בדיקה אם כבר קיים אורח עם אותו שם למשתמש הזה
    let existingGuest;
    
    // אם יש שיתוף אירוע, בדוק לפי מזהה האירוע המשותף
    if (user.sharedEventId) {
      existingGuest = await Guest.findOne({
        sharedEventId: user.sharedEventId,
        name: guestName,
        userId: userObjectId
      });
    } else {
      // אחרת, בדוק רק לפי מזהה משתמש
      existingGuest = await Guest.findOne({
        name: guestName,
        userId: userObjectId
      });
    }
    
    // אם האורח כבר קיים, עדכן אותו במקום ליצור חדש
    if (existingGuest) {
      console.log(`[GUEST API] Guest with name "${guestName}" already exists, updating instead of creating new`);
      
      // עדכון האורח הקיים
      existingGuest.phoneNumber = phoneNumber;
      existingGuest.numberOfGuests = numberOfGuests !== undefined && numberOfGuests !== null ? numberOfGuests : 1;
      existingGuest.side = side || 'משותף';
      existingGuest.isConfirmed = isConfirmed === undefined ? null : isConfirmed;
      existingGuest.notes = notes || '';
      existingGuest.updatedAt = new Date();
      
      // אם יש מזהה אירוע משותף, ודא שהוא מוגדר
      if (user.sharedEventId) {
        existingGuest.sharedEventId = user.sharedEventId;
      }
      
      await existingGuest.save();
      
      // אם יש חשבון מקושר, עדכן גם את העותק שלו
      if (user.connectedUserId && user.sharedEventId) {
        try {
          // חיפוש העותק של השותף
          const partnerCopy = await Guest.findOne({
            name: guestName,
            userId: new mongoose.Types.ObjectId(user.connectedUserId),
            sharedEventId: user.sharedEventId
          });
          
          if (partnerCopy) {
            // עדכון העותק של השותף
            partnerCopy.phoneNumber = phoneNumber;
            partnerCopy.numberOfGuests = numberOfGuests !== undefined && numberOfGuests !== null ? numberOfGuests : 1;
            partnerCopy.side = side || 'משותף';
            partnerCopy.isConfirmed = isConfirmed === undefined ? null : isConfirmed;
            partnerCopy.notes = notes || '';
            partnerCopy.updatedAt = new Date();
            
            await partnerCopy.save();
            console.log(`[GUEST API] Updated partner's copy: ${partnerCopy._id}`);
          } else {
            // אם אין עותק לשותף, צור אחד
            const newPartnerCopy = new Guest({
              userId: new mongoose.Types.ObjectId(user.connectedUserId),
              name: guestName,
              phoneNumber,
              numberOfGuests: numberOfGuests !== undefined && numberOfGuests !== null ? numberOfGuests : 1,
              side: side || 'משותף',
              isConfirmed: isConfirmed === undefined ? null : isConfirmed,
              notes: notes || '',
              sharedEventId: user.sharedEventId,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            await newPartnerCopy.save();
            console.log(`[GUEST API] Created partner's copy: ${newPartnerCopy._id}`);
          }
        } catch (syncError) {
          console.error(`[GUEST API] Error syncing to partner: ${syncError}`);
          // Continue execution even if sync fails
        }
      }
      
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
      sharedEventId?: string;
    } = {
      userId: userObjectId,
      name: guestName,
      phoneNumber,
      numberOfGuests: numberOfGuests !== undefined && numberOfGuests !== null ? numberOfGuests : 1,
      side: side || 'משותף',
      isConfirmed: isConfirmed === undefined ? null : isConfirmed,
      notes: notes || ''
    };
    
    // ALWAYS add sharedEventId if available - this is critical for data sharing
    if (user.sharedEventId) {
      console.log(`[GUEST API] Adding shared event ID ${user.sharedEventId} to new guest`);
      guestData.sharedEventId = user.sharedEventId;
    }
    
    const guest = await Guest.create(guestData);
    console.log(`[GUEST API] Created new guest with ID ${guest._id}`);

    // After creating a new guest, also create a copy for the connected user if they exist
    if (user.connectedUserId && user.sharedEventId) {
      try {
        // בדיקה אם כבר קיים עותק אצל השותף
        const existingPartnerCopy = await Guest.findOne({
          name: guestName,
          userId: new mongoose.Types.ObjectId(user.connectedUserId),
          sharedEventId: user.sharedEventId
        });
        
        if (!existingPartnerCopy) {
          // יצירת עותק לשותף רק אם לא קיים כבר
          const connectedGuestData = {
            ...guestData,
            userId: new mongoose.Types.ObjectId(user.connectedUserId),
            sharedEventId: user.sharedEventId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Create connected user's copy
          const connectedGuest = await Guest.create(connectedGuestData);
          console.log(`[GUEST API] Created copy of guest for connected user: ${connectedGuest._id}`);
        } else {
          console.log(`[GUEST API] Partner already has a copy of this guest: ${existingPartnerCopy._id}`);
        }
      } catch (copyError) {
        console.error(`[GUEST API] Error creating guest copy for connected user: ${copyError}`);
        // Continue execution even if copy fails
      }
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
