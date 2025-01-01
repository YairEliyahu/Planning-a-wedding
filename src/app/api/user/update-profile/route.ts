import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const data = await request.json();
    const { userId, ...profileData } = data;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // עדכון נתוני המשתמש
    Object.assign(user, {
      ...profileData,
      isProfileComplete: true,
      updatedAt: new Date()
    });

    await user.save();

    // יצירת טוקן חדש עם הנתונים המעודכנים
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        isProfileComplete: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // החזרת המשתמש המעודכן והטוקן החדש
    return NextResponse.json({ 
      success: true, 
      user: {
        _id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        isProfileComplete: true,
        ...profileData
      },
      token
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 