import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // בדיקת אימות אדמין (בפרויקט אמיתי זה יהיה JWT validation)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await User.find({})
      .select('-password') // לא להחזיר סיסמאות
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 