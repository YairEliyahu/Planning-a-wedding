import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Guest from '@/models/Guest';

export async function DELETE(request: NextRequest) {
  try {
    // קבלת מזהה המשתמש מפרמטרי ה-URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // בדיקה שמזהה המשתמש קיים
    if (!userId) {
      return NextResponse.json(
        { message: 'מזהה משתמש חסר' },
        { status: 400 }
      );
    }
    
    // התחברות למסד הנתונים
    await dbConnect();
    
    // מחיקת כל האורחים של המשתמש
    const result = await Guest.deleteMany({ userId });
    
    return NextResponse.json(
      { message: 'כל האורחים נמחקו בהצלחה', deletedCount: result.deletedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete all guests:', error);
    return NextResponse.json(
      { message: 'שגיאה במחיקת האורחים' },
      { status: 500 }
    );
  }
} 