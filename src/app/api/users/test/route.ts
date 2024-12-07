import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({}, { password: 0 }); // לא כולל סיסמאות
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 