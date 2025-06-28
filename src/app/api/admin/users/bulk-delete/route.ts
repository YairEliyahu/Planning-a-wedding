import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // בדיקת אימות אדמין
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds } = await request.json();
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }

    // מחיקה מרוכזת
    const result = await User.deleteMany({
      _id: { $in: userIds }
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error bulk deleting users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 