import { NextResponse } from 'next/server';
import connectToDatabase from '../../../utils/dbConnect';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

interface DecodedInvitationToken {
  inviterId: string;
  partnerEmail: string;
  partnerName?: string;
  partnerPhone?: string;
  type: string;
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'חסר טוקן אימות' },
        { status: 400 }
      );
    }

    // חיבור למסד הנתונים
    await connectToDatabase();

    // אימות הטוקן
    let decoded: DecodedInvitationToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedInvitationToken;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'הטוקן אינו תקף או שפג תוקפו' },
        { status: 401 }
      );
    }

    // מציאת המשתמש המזמין
    const inviter = await User.findById(decoded.inviterId);
    if (!inviter) {
      return NextResponse.json(
        { success: false, message: 'המשתמש המזמין לא נמצא' },
        { status: 404 }
      );
    }

    // בדיקה שההזמנה עדיין פעילה
    if (inviter.partnerEmail !== decoded.partnerEmail) {
      return NextResponse.json(
        { success: false, message: 'ההזמנה אינה תקפה עוד' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      inviterId: inviter._id,
      inviterName: inviter.fullName,
      partnerEmail: decoded.partnerEmail,
      partnerName: decoded.partnerName || '',
      partnerPhone: decoded.partnerPhone || ''
    });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { success: false, message: 'שגיאה באימות ההזמנה' },
      { status: 500 }
    );
  }
} 