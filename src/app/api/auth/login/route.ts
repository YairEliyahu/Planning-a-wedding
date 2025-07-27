import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    console.log('=== Starting login process ===');
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database successfully');

    const { email, password } = await req.json();
    console.log('Login attempt for email:', email);
    console.log('Password provided:', !!password, 'length:', password?.length);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ 
        success: false,
        message: 'נא להזין אימייל וסיסמה', 
        action: 'COMPLETE_FIELDS'
      }, { status: 400 });
    }

    console.log('Searching for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    
    console.log('Database query completed');
    console.log('User found:', !!user);

    // אם המשתמש לא קיים בכלל
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ 
        success: false,
        message: 'המייל לא קיים במערכת. האם תרצה להירשם?',
        action: 'REGISTER'
      }, { status: 401 });
    }

    console.log('User details:', { 
      id: user._id,
      email: user.email, 
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      authProvider: user.authProvider,
      isProfileComplete: user.isProfileComplete,
      passwordPreview: user.password ? user.password.substring(0, 10) + '...' : 'none'
    });

    // בודקים אם יש סיסמה
    if (!user.password) {
      console.log('User has no password set');
      if (user.authProvider === 'google') {
        return NextResponse.json({ 
          success: false,
          message: 'משתמש זה רשום באמצעות Google. ניתן להתחבר באמצעות Google או להגדיר סיסמה',
          action: 'USE_GOOGLE_OR_SET_PASSWORD',
          canSetPassword: true,
          email: user.email
        }, { status: 400 });
      } else {
        return NextResponse.json({ 
          success: false,
          message: 'לא הוגדרה סיסמה למשתמש זה. אנא אפס את הסיסמה',
          action: 'RESET_PASSWORD'
        }, { status: 400 });
      }
    }

    // מנסים להתחבר עם הסיסמה
    console.log('User has password, comparing passwords...');
    console.log('Input password length:', password.length);
    console.log('Stored hashed password length:', user.password.length);
    console.log('Stored hashed password:', user.password.substring(0, 10) + '...');
    
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('Password is valid, generating token...');
        // אם הסיסמה תקינה, מחברים את המשתמש
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign(
          {
            userId: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            isProfileComplete: user.isProfileComplete,
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        const userResponse = {
          _id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          isProfileComplete: user.isProfileComplete,
        };

        console.log('Login successful, returning token and user data');

        return NextResponse.json({
          success: true,
          message: 'התחברת בהצלחה',
          token,
          user: userResponse,
        });
      } else {
        console.log('Password is invalid');
        // אם הסיסמה שגויה
        return NextResponse.json({ 
          success: false,
          message: 'הסיסמה שגויה. נסה שוב או אפס את הסיסמה',
          action: 'WRONG_PASSWORD',
          canResetPassword: true
        }, { status: 401 });
      }
    } catch (bcryptError) {
      console.error('Error comparing passwords:', bcryptError);
      throw bcryptError;
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'אירעה שגיאה. נסה שוב מאוחר יותר',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
