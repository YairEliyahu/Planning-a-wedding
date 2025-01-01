import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Starting set password process ===');
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database successfully');

    const { password } = await req.json();
    console.log('Setting password for user ID:', params.id);
    console.log('Password length:', password?.length);

    if (!password || password.length < 6) {
      console.log('Password validation failed: too short or missing');
      return NextResponse.json(
        { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
        { status: 400 }
      );
    }

    // מצפינים את הסיסמה
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully, length:', hashedPassword.length);
    console.log('Hashed password preview:', hashedPassword.substring(0, 10) + '...');

    // מעדכנים את המשתמש
    console.log('Updating user in database...');
    
    // קודם מוצאים את המשתמש
    const user = await User.findById(params.id);
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { message: 'משתמש לא נמצא' },
        { status: 404 }
      );
    }

    // מעדכנים את הסיסמה ישירות על המסמך
    user.password = hashedPassword;
    
    // שומרים את השינויים
    await user.save();

    // בודקים שהסיסמה נשמרה בהצלחה
    const updatedUser = await User.findById(params.id);
    console.log('Verification - Updated user details:', {
      id: updatedUser?._id,
      email: updatedUser?.email,
      hasPassword: !!updatedUser?.password,
      passwordLength: updatedUser?.password?.length,
      authProvider: updatedUser?.authProvider,
      passwordPreview: updatedUser?.password ? updatedUser.password.substring(0, 10) + '...' : 'none'
    });

    // בדיקה נוספת שהסיסמה נשמרה ומוצפנת נכון
    const verifyPassword = await bcrypt.compare(password, updatedUser?.password || '');
    console.log('Password verification test:', verifyPassword);

    return NextResponse.json({
      success: true,
      message: 'הסיסמה הוגדרה בהצלחה'
    });

  } catch (error) {
    console.error('Error setting password:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'אירעה שגיאה בהגדרת הסיסמה',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 