import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../utils/dbConnect';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// מטמון עבור נתוני משתמש - מוגדל מ-5 דקות ל-10 דקות
const userCache = new Map<string, { data: UserDocument; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 דקות

// Define a type for the user document
interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  fullName: string;
  isProfileComplete: boolean;
  phone?: string;
  weddingDate?: Date;
  partnerName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  expectedGuests?: string;
  weddingLocation?: string;
  budget?: string;
  preferences?: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  connectedUserId?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // בדיקת מטמון משופרת
    const cachedUser = userCache.get(params.id);
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      return NextResponse.json({ user: cachedUser.data }, {
        headers: {
          'Cache-Control': 'private, max-age=600', // 10 דקות
          'Last-Modified': new Date(cachedUser.timestamp).toUTCString()
        }
      });
    }

    // חיבור למסד הנתונים
    await connectToDatabase();

    const userId = params.id;
    
    // שיפור חיפוש המשתמש עם אופטימיזציות
    const user = await User.findById(userId)
      .select('-password -__v') // לא נביא גם __v
      .lean() // שימוש ב-lean() לקבלת אובייקט JavaScript רגיל
      .exec(); // שימוש ב-exec() לביצועים טובים יותר

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // שמירה במטמון עם TTL
    userCache.set(params.id, {
      data: user as unknown as UserDocument,
      timestamp: Date.now()
    });

    // ניקוי אוטומטי של מטמון ישן
    setTimeout(() => {
      const entry = userCache.get(params.id);
      if (entry && Date.now() - entry.timestamp >= CACHE_TTL) {
        userCache.delete(params.id);
      }
    }, CACHE_TTL);

    return NextResponse.json({ user }, {
      headers: {
        'Cache-Control': 'private, max-age=600',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${(user as any)._id}-${(user as any).updatedAt?.getTime() || Date.now()}"`
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const userId = params.id;
    const userData = await request.json();
    
    console.log('PUT request body:', userData);

    // נקה מטמון בעת עדכון
    userCache.delete(params.id);

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('Before update - user data:', {
      partnerName: user.partnerName,
      partnerPhone: user.partnerPhone,
      partnerEmail: user.partnerEmail
    });
    
    // Clean up empty partner fields to avoid validation errors
    const cleanedUserData = { ...userData };
    
    // If partnerGender is empty string, don't include it (to avoid enum validation error)
    if (cleanedUserData.partnerGender === '') {
      delete cleanedUserData.partnerGender;
    }
    
    // If no partner details provided, clear partner fields
    const hasPartnerDetails = cleanedUserData.partnerName || 
                             cleanedUserData.partnerEmail || 
                             cleanedUserData.partnerPhone || 
                             cleanedUserData.partnerIdNumber;
    
    if (!hasPartnerDetails && 
        (cleanedUserData.partnerName === '' || 
         cleanedUserData.partnerEmail === '' || 
         cleanedUserData.partnerPhone === '' || 
         cleanedUserData.partnerIdNumber === '' || 
         cleanedUserData.partnerGender === '')) {
      // Clear all partner fields if they're empty
      cleanedUserData.partnerName = undefined;
      cleanedUserData.partnerEmail = undefined;
      cleanedUserData.partnerPhone = undefined;
      cleanedUserData.partnerIdNumber = undefined;
      cleanedUserData.partnerGender = undefined;
    }
    
    // Update the user fields
    Object.assign(user, cleanedUserData);
    await user.save();
    
    console.log('After update - user data:', {
      partnerName: user.partnerName,
      partnerPhone: user.partnerPhone,
      partnerEmail: user.partnerEmail
    });
    
    // If this user is connected to someone else, sync necessary data
    if (user.connectedUserId) {
      const connectedUser = await User.findById(user.connectedUserId);
      
      if (connectedUser) {
        console.log('Syncing data with connected user:', connectedUser._id);
        
        // השדות המשותפים שצריכים להיות מסונכרנים
        const syncFields = [
          'weddingDate', 'expectedGuests', 'weddingLocation', 'budget', 
          'preferences', 'venueType', 'timeOfDay', 'locationPreference'
        ];
        
        // העתקת השדות המשותפים
        syncFields.forEach(field => {
          if (field in userData) {
            console.log(`Syncing field ${field}:`, user[field]);
            connectedUser[field] = user[field];
          }
        });
        
        await connectedUser.save();
        console.log('Connected user updated successfully');
        
        // נקה גם את המטמון של המשתמש המחובר
        userCache.delete(user.connectedUserId.toString());
      }
    }

    return NextResponse.json({ 
      message: 'User updated successfully',
      user
    }, {
      headers: {
        'Cache-Control': 'no-cache' // לא לשמור במטמון אחרי עדכון
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('PATCH request body:', body);
    await connectToDatabase();

    // נקה מטמון של המשתמש הנוכחי
    userCache.delete(params.id);

    // עידוא שה-ID תקין
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // עיבוד התאריך אם קיים
    const processedData = { ...body };
    if (processedData.weddingDate) {
      processedData.weddingDate = new Date(processedData.weddingDate);
    }

    // וידוא שה-preferences הם בפורמט הנכון
    if (processedData.preferences) {
      processedData.preferences = {
        venue: Boolean(processedData.preferences.venue),
        catering: Boolean(processedData.preferences.catering),
        photography: Boolean(processedData.preferences.photography),
        music: Boolean(processedData.preferences.music),
        design: Boolean(processedData.preferences.design)
      };
    }

    // עידוא שכל השדות המספריים מטופלים נכון
    if (processedData.expectedGuests) {
      processedData.expectedGuests = processedData.expectedGuests.toString();
    }
    if (processedData.budget) {
      processedData.budget = processedData.budget.toString();
    }

    console.log('Processed data for update:', {
      partnerName: processedData.partnerName,
      partnerPhone: processedData.partnerPhone,
      partnerEmail: processedData.partnerEmail
    });

    // עדכון המשתמש
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { 
        $set: {
          phone: processedData.phone,
          weddingDate: processedData.weddingDate,
          partnerName: processedData.partnerName,
          partnerPhone: processedData.partnerPhone,
          partnerEmail: processedData.partnerEmail,
          expectedGuests: processedData.expectedGuests,
          weddingLocation: processedData.weddingLocation,
          budget: processedData.budget,
          preferences: processedData.preferences,
          isProfileComplete: true,
          updatedAt: new Date()
        }
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password').lean() as unknown as UserDocument;

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Updated user data - partnerName:', updatedUser.partnerName);

    // נקה מטמון של כל המשתמשים הקשורים (במקרה של שיתוף)
    if (updatedUser.connectedUserId) {
      userCache.delete(updatedUser.connectedUserId.toString());
    }
    
    // מצא משתמשים שמחוברים למשתמש הזה
    const connectedUsers = await User.find({ connectedUserId: params.id }).select('_id');
    connectedUsers.forEach(user => {
      userCache.delete(user._id.toString());
    });

    // יצירת טוקן חדש עם המידע המעודכן
    const token = jwt.sign(
      {
        userId: updatedUser._id.toString(),
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        isProfileComplete: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // המרת ה-_id לstring
    const userResponse = {
      ...updatedUser,
      _id: updatedUser._id.toString()
    };

    return NextResponse.json({ 
      success: true, 
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 