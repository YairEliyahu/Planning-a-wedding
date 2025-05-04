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
    const { token } = await request.json();

    if (!token) {
      console.log('Token is missing');
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
      console.log('Decoded token:', decoded);
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Ensure this is an invitation token
    if (decoded.purpose !== 'partner-invite') {
      console.log('Invalid token purpose:', decoded.purpose);
      return NextResponse.json(
        { message: 'Invalid token type' },
        { status: 400 }
      );
    }

    // Find the inviter
    const inviter = await User.findById(decoded.inviterId);
    if (!inviter) {
      console.log('Inviter not found for ID:', decoded.inviterId);
      return NextResponse.json(
        { message: 'Inviter not found' },
        { status: 404 }
      );
    }

    // Check if the invitation is still pending
    console.log('Invitation status:', {
      inviterId: inviter._id,
      pending: inviter.partnerInvitePending,
      accepted: inviter.partnerInviteAccepted,
      partnerEmail: inviter.partnerEmail
    });

    // Allow validation even if already accepted
    if (!inviter.partnerInvitePending && !inviter.partnerInviteAccepted) {
      return NextResponse.json(
        { message: 'Invitation has already been used or canceled' },
        { status: 400 }
      );
    }

    // Check if the partner email matches
    if (inviter.partnerEmail !== decoded.partnerEmail) {
      console.log('Email mismatch:', {
        tokenEmail: decoded.partnerEmail,
        inviterPartnerEmail: inviter.partnerEmail
      });
      return NextResponse.json(
        { message: 'Partner email mismatch' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      inviterId: inviter._id,
      inviterName: inviter.fullName,
      partnerEmail: decoded.partnerEmail
    });

  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { message: 'Error verifying invitation', error: (error as Error).message },
      { status: 500 }
    );
  }
} 