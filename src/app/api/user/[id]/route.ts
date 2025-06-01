import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../utils/dbConnect';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// מטמון עבור נתוני משתמש
const userCache = new Map<string, { data: UserDocument; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 דקות

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
  updatedAt: Date;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // בדיקת מטמון
    const cachedUser = userCache.get(params.id);
    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      return NextResponse.json({ user: cachedUser.data });
    }

    // חיבור למסד הנתונים
    await connectToDatabase();

    const userId = params.id;
    const user = await User.findById(userId)
      .select('-password') // לא נביא את הסיסמה
      .lean(); // שימוש ב-lean() לקבלת אובייקט JavaScript רגיל

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // שמירה במטמון
    userCache.set(params.id, {
      data: user as unknown as UserDocument,
      timestamp: Date.now()
    });

    return NextResponse.json({ user });
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

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update the user fields
    Object.assign(user, userData);
    await user.save();
    
    // If this user is connected to someone else, sync necessary data
    if (user.connectedUserId) {
      const connectedUser = await User.findById(user.connectedUserId);
      
      if (connectedUser) {
        // השדות המשותפים שצריכים להיות מסונכרנים
        const syncFields = [
          'weddingDate', 'expectedGuests', 'weddingLocation', 'budget', 
          'preferences', 'venueType', 'timeOfDay', 'locationPreference'
        ];
        
        // העתקת השדות המשותפים
        syncFields.forEach(field => {
          if (field in userData) {
            connectedUser[field] = user[field];
          }
        });
        
        await connectedUser.save();
      }
    }

    return NextResponse.json({ 
      message: 'User updated successfully',
      user
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
    await connectToDatabase();

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