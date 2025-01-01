import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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
          phoneNumber: processedData.phoneNumber,
          weddingDate: processedData.weddingDate,
          partnerName: processedData.partnerName,
          partnerPhone: processedData.partnerPhone,
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
    ).select('-password').lean();

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