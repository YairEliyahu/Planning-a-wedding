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
      password: body.password ? `[${body.password.length} chars]` : undefined,
      isProfileComplete: body.isProfileComplete
    });

    const { 
      email, 
      password, 
      fullName,
      age,
      gender,
      location,
      phone,
      idNumber,
      isProfileComplete = false,
      // Partner connection data
      partnerName,
      partnerEmail,
      partnerPhone,
      partnerIdNumber,
      partnerGender,
      // Wedding data from inviter
      weddingDate,
      expectedGuests,
      weddingLocation,
      budget,
      preferences,
      venueType,
      timeOfDay,
      locationPreference
    } = body;

    console.log('Extracted isProfileComplete:', isProfileComplete);

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

    // יצירת משתמש חדש
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      age: age ? Number(age) : undefined,
      gender: gender || undefined, // Fix: Don't send empty string for enum field
      location,
      phone,
      idNumber,
      authProvider: 'email',
      emailVerified: false,
      isProfileComplete: isProfileComplete,
      // Partner connection data
      partnerName,
      partnerEmail,
      partnerPhone,
      partnerIdNumber,
      partnerGender: partnerGender || undefined, // Fix: Don't send empty string for enum field
      // Wedding data from inviter
      weddingDate,
      expectedGuests,
      weddingLocation,
      budget,
      preferences,
      venueType,
      timeOfDay,
      locationPreference
    });

    console.log('Creating user with data:', {
      ...user.toObject(),
      password: '[HIDDEN]',
      isProfileComplete: user.isProfileComplete
    });

    // שמירת המשתמש
    await user.save();
    console.log('User created successfully with ID:', user._id, 'isProfileComplete:', user.isProfileComplete);

    // אם יש partnerEmail, נחפש את המשתמש המזמין ונחבר ביניהם
    if (partnerEmail) {
      console.log('Looking for inviter with partner email:', partnerEmail);
      const inviter = await User.findOne({ 
        $or: [
          { email: partnerEmail },
          { partnerEmail: email }
        ]
      });

      if (inviter) {
        console.log('Found inviter:', inviter._id);
        
        // יצירת sharedEventId (נשתמש ב-ID של המזמין)
        const sharedEventId = inviter._id.toString();
        
        // עדכון המשתמש החדש עם sharedEventId ו-connectedUserId
        user.sharedEventId = sharedEventId;
        user.connectedUserId = inviter._id;
        await user.save();
        
        // עדכון המזמין עם connectedUserId
        inviter.connectedUserId = user._id;
        await inviter.save();
        
        console.log('Connected users with sharedEventId:', sharedEventId);
      }
    }

    // בדיקה מיידית שהמשתמש נשמר עם הסיסמה
    const savedUser = await User.findById(user._id);
    console.log('Verification - Saved user details:', {
      id: savedUser?._id,
      email: savedUser?.email,
      hasPassword: !!savedUser?.password,
      passwordLength: savedUser?.password?.length,
      authProvider: savedUser?.authProvider,
      sharedEventId: savedUser?.sharedEventId,
      connectedUserId: savedUser?.connectedUserId
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

    console.log('Sending response with user data:', {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      isProfileComplete: user.isProfileComplete,
      sharedEventId: user.sharedEventId,
      connectedUserId: user.connectedUserId
    });

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
          sharedEventId: user.sharedEventId,
          connectedUserId: user.connectedUserId,
          partnerName: user.partnerName,
          partnerEmail: user.partnerEmail,
          partnerPhone: user.partnerPhone,
          partnerIdNumber: user.partnerIdNumber,
          partnerGender: user.partnerGender,
          weddingDate: user.weddingDate,
          expectedGuests: user.expectedGuests,
          weddingLocation: user.weddingLocation,
          budget: user.budget,
          preferences: user.preferences,
          venueType: user.venueType,
          timeOfDay: user.timeOfDay,
          locationPreference: user.locationPreference
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
