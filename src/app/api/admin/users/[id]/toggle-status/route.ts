import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // בדיקת אימות אדמין
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    
    // קבלת המשתמש הנוכחי
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // הפיכת הסטטוס
    user.isActive = !user.isActive;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      isActive: user.isActive 
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 