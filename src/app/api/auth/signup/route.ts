import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    console.log('Starting signup process...');
    await connectToDatabase();

    const body = await req.json();
    const { fullName, age, gender, location, phone, idNumber, email, password } = body;

    console.log('Checking for existing user...');
    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Email already registered'
      }, { status: 400 });
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // יצירת משתמש חדש בקולקציית users
    const newUser = await User.create({
      fullName,
      age: Number(age),
      gender,
      location,
      phone,
      idNumber,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    console.log('User created successfully:', newUser._id);

    // הכנת אובייקט התגובה ללא סיסמה
    const userResponse = {
      _id: newUser._id.toString(),
      fullName: newUser.fullName,
      email: newUser.email,
      age: newUser.age,
      gender: newUser.gender,
      location: newUser.location,
      phone: newUser.phone,
      idNumber: newUser.idNumber
    };

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
