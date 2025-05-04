import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  inviterId: string;
  partnerEmail: string;
  purpose: string;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    // פרסור הבקשה בצורה בטוחה
    let body;
    try {
      body = await request.json();
    } catch (err) {
      console.error('Error parsing request JSON:', err);
      return NextResponse.json(
        { message: 'Invalid JSON in request' },
        { status: 400 }
      );
    }

    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // אימות הטוקן
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // וידוא שזה טוקן הזמנה
    if (decoded.purpose !== 'partner-invite') {
      return NextResponse.json(
        { message: 'Invalid token type' },
        { status: 400 }
      );
    }

    // מציאת המשתמש המזמין
    const inviter = await User.findById(decoded.inviterId);
    if (!inviter) {
      return NextResponse.json(
        { message: 'Inviter not found' },
        { status: 404 }
      );
    }

    // בדיקה אם המשתמש המוזמן כבר קיים במערכת
    const existingPartner = await User.findOne({ email: decoded.partnerEmail });
    
    // החזרת מידע מתאים
    return NextResponse.json({
      valid: true,
      inviterId: inviter._id,
      inviterName: inviter.fullName,
      inviterWeddingDate: inviter.weddingDate,
      partnerEmail: decoded.partnerEmail,
      partnerName: inviter.partnerName || '',
      partnerPhone: inviter.partnerPhone || '',
      partnerExists: existingPartner ? true : false,
      partnerId: existingPartner ? existingPartner._id : null,
      invitationStatus: inviter.partnerInviteAccepted ? 'accepted' : 'pending'
    });

  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { message: 'Error verifying invitation', error: (error as Error).message },
      { status: 500 }
    );
  }
} 