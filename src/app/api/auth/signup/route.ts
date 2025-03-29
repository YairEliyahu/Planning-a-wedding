import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    console.log('=== Starting signup process ===');
    await connectToDatabase();
    console.log('Connected to database successfully');

    const body = await req.json();
    console.log('Received registration data:', {
      ...body,
      password: body.password ? `[${body.password.length} chars]` : undefined
    });

    const { 
      email, 
      password, 
      fullName,
      age,
      gender,
      location,
      phone,
      idNumber 
    } = body;

    // בדיקת שדות חובה
    if (!email || !password || !fullName) {
      console.log('Missing required fields:', {
        hasEmail: !!email,
        hasPassword: !!password,
        hasFullName: !!fullName
      });
      return NextResponse.json(
        { message: 'חסרים שדות חובה: אימייל, סיסמה ושם מלא' },
        { status: 400 }
      );
    }

    // בדיקת אורך סיסמה
    if (password.length < 6) {
      console.log('Password too short:', password.length);
      return NextResponse.json(
        { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
        { status: 400 }
      );
    }

    // בדיקה אם המשתמש כבר קיים
    console.log('Checking for existing user with email:', email.toLowerCase());
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists with ID:', existingUser._id);
      return NextResponse.json(
        { message: 'משתמש עם אימייל זה כבר קיים במערכת' },
        { status: 400 }
      );
    }

    // הצפנת הסיסמה
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    console.log('Original password length:', password.length);
    console.log('Hashed password length:', hashedPassword.length);
    console.log('Hashed password preview:', hashedPassword.substring(0, 10) + '...');

    // יצירת משתמש חדש
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      age: age ? Number(age) : undefined,
      gender,
      location,
      phone,
      idNumber,
      authProvider: 'email',
      emailVerified: false,
      isProfileComplete: false,
    });

    console.log('Creating user with data:', {
      ...user.toObject(),
      password: '[HIDDEN]'
    });

    // שמירת המשתמש
    await user.save();
    console.log('User created successfully with ID:', user._id);

    // בדיקה מיידית שהמשתמש נשמר עם הסיסמה
    const savedUser = await User.findById(user._id);
    console.log('Verification - Saved user details:', {
      id: savedUser?._id,
      email: savedUser?.email,
      hasPassword: !!savedUser?.password,
      passwordLength: savedUser?.password?.length,
      authProvider: savedUser?.authProvider,
      passwordPreview: savedUser?.password ? savedUser.password.substring(0, 10) + '...' : 'none'
    });

    // בדיקת הסיסמה המוצפנת
    const verifyPassword = await bcrypt.compare(password, savedUser?.password || '');
    console.log('Password verification test:', verifyPassword);

    if (!verifyPassword) {
      console.error('Password verification failed! The saved password is not valid.');
      // מוחקים את המשתמש אם הסיסמה לא נשמרה נכון
      await User.findByIdAndDelete(user._id);
      throw new Error('Failed to save password correctly');
    }

    // יצירת טוקן
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

    return NextResponse.json(
      {
        message: 'משתמש נוצר בהצלחה',
        token,
        user: {
          _id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          age: user.age,
          gender: user.gender,
          location: user.location,
          phone: user.phone,
          idNumber: user.idNumber,
          isProfileComplete: user.isProfileComplete,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        message: 'אירעה שגיאה ביצירת המשתמש',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
