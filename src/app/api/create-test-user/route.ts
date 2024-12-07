import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST() {
  try {
    await connectToDatabase();
    
    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      return NextResponse.json({ message: 'Test user already exists' });
    }

    // יצירת משתמש בדיקה
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const testUser = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      fullName: 'Test User',
      age: 30,
      gender: 'Other',
      location: 'Test Location',
      phone: '1234567890',
      idNumber: '123456789'
    });

    return NextResponse.json({ 
      message: 'Test user created successfully',
      user: {
        email: testUser.email,
        fullName: testUser.fullName
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json({ 
      message: 'Failed to create test user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 