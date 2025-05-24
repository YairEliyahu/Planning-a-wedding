import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    console.log('=== Starting set password process ===');
    await connectToDatabase();

    const { email, password, confirmPassword } = await req.json();
    console.log('Set password attempt for email:', email);

    if (!email || !password || !confirmPassword) {
      return NextResponse.json({ 
        success: false,
        message: 'נא למלא את כל השדות הנדרשים'
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ 
        success: false,
        message: 'הסיסמאות אינן תואמות'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        success: false,
        message: 'הסיסמה חייבת להכיל לפחות 6 תווים'
      }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        message: 'משתמש לא נמצא'
      }, { status: 404 });
    }

    // בדיקה שהמשתמש אכן רשום עם Google או שאין לו סיסמה
    if (user.password && user.authProvider !== 'google') {
      return NextResponse.json({ 
        success: false,
        message: 'למשתמש זה כבר יש סיסמה מוגדרת'
      }, { status: 400 });
    }

    // הצפנת הסיסמה החדשה
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // עדכון המשתמש עם הסיסמה החדשה
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      authProvider: 'hybrid' // מציין שהמשתמש יכול להתחבר גם עם Google וגם עם סיסמה
    });

    console.log('Password set successfully for user:', user.email);

    return NextResponse.json({
      success: true,
      message: 'הסיסמה הוגדרה בהצלחה! כעת ניתן להתחבר גם עם סיסמה וגם עם Google'
    });

  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'אירעה שגיאה בהגדרת הסיסמה',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 