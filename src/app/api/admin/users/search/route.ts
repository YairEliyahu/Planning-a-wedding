import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // בדיקת אימות אדמין
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
      return NextResponse.json([]);
    }

    // חיפוש לפי שם מלא או אימייל
    const users = await User.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { partnerName: { $regex: query, $options: 'i' } },
        { partnerEmail: { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(50);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 