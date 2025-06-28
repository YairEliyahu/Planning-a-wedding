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
    
    // בניית אובייקט הסינון
    const filter: any = {};
    
    if (searchParams.get('role')) {
      filter.role = searchParams.get('role');
    }
    
    if (searchParams.get('isActive')) {
      filter.isActive = searchParams.get('isActive') === 'true';
    }
    
    if (searchParams.get('emailVerified')) {
      filter.emailVerified = searchParams.get('emailVerified') === 'true';
    }
    
    if (searchParams.get('authProvider')) {
      filter.authProvider = searchParams.get('authProvider');
    }
    
    if (searchParams.get('isProfileComplete')) {
      filter.isProfileComplete = searchParams.get('isProfileComplete') === 'true';
    }

    // חיפוש עם הסינונים
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error filtering users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 