import { NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Guest from '../../../models/Guest';

interface DecodedToken {
  inviterId: string;
  partnerEmail: string;
  purpose: string;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return NextResponse.json(
        { message: 'Token and userId are required' },
        { status: 400 }
      );
    }

    // Verify the token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Ensure this is an invitation token
    if (decoded.purpose !== 'partner-invite') {
      return NextResponse.json(
        { message: 'Invalid token type' },
        { status: 400 }
      );
    }

    // Find the inviter (main account)
    const inviter = await User.findById(decoded.inviterId);
    if (!inviter) {
      return NextResponse.json(
        { message: 'Inviter not found' },
        { status: 404 }
      );
    }

    // Find the invited user (partner account)
    const partner = await User.findById(userId);
    if (!partner) {
      return NextResponse.json(
        { message: 'Partner user not found' },
        { status: 404 }
      );
    }

    // Check if the invited user's email matches the one in the token
    if (partner.email !== decoded.partnerEmail) {
      return NextResponse.json(
        { message: 'You must accept the invitation with the same email it was sent to' },
        { status: 400 }
      );
    }

    // Check if the invitation is still pending
    if (!inviter.partnerInvitePending) {
      return NextResponse.json(
        { message: 'Invitation has already been used or canceled' },
        { status: 400 }
      );
    }

    // Link the accounts together
    // Update inviter: mark invitation as accepted
    inviter.partnerInvitePending = false;
    inviter.partnerInviteAccepted = true;
    
    // Create a shared event ID if not exists
    if (!inviter.sharedEventId) {
      inviter.sharedEventId = new mongoose.Types.ObjectId().toString();
      inviter.isMainEventOwner = true;
    }
    
    // Connect inviter to partner
    inviter.connectedUserId = partner._id;
    await inviter.save();

    // Update partner account with ALL inviter details
    partner.partnerInviteAccepted = true;
    
    // Connect to the same shared event
    partner.sharedEventId = inviter.sharedEventId;
    partner.isMainEventOwner = false;
    partner.connectedUserId = inviter._id;
    
    // Copy ALL relevant wedding and profile data from the inviter to the partner
    // So both accounts have access to the same information and profile is marked as complete
    
    // wedding details
    partner.weddingDate = inviter.weddingDate;
    partner.expectedGuests = inviter.expectedGuests;
    partner.weddingLocation = inviter.weddingLocation;
    partner.budget = inviter.budget;
    partner.preferences = inviter.preferences;
    partner.venueType = inviter.venueType;
    partner.timeOfDay = inviter.timeOfDay;
    partner.locationPreference = inviter.locationPreference;
    
    // partner details - copy from inviter to partner (mirror data)
    partner.partnerName = inviter.fullName;
    partner.partnerPhone = inviter.phone;
    partner.partnerEmail = inviter.email;
    partner.partnerIdNumber = inviter.idNumber;
    partner.partnerGender = inviter.gender;
    
    // copy remaining profile fields if they exist in inviter
    if (inviter.age) partner.age = inviter.age;
    if (inviter.location) partner.location = inviter.location;
    if (inviter.idNumber) partner.idNumber = inviter.idNumber;
    
    // Mark profile as complete so user doesn't need to fill it out
    partner.isProfileComplete = true;
    
    await partner.save();
    
    // Synchronize guest list data
    // Find all guests from the inviter account
    const inviterGuests = await Guest.find({ userId: inviter._id });
    
    // If the inviter has guests, ensure they all have the shared event ID
    if (inviterGuests.length > 0) {
      try {
        // Update all guests to include the shared event ID for future queries
        await Guest.updateMany(
          { userId: inviter._id },
          { $set: { sharedEventId: inviter.sharedEventId } }
        );
        
        // Check if partner has any guests already
        const partnerGuests = await Guest.find({ userId: partner._id });
        
        if (partnerGuests.length > 0) {
          // Update partner's guests to have the same shared event ID
          await Guest.updateMany(
            { userId: partner._id },
            { $set: { sharedEventId: inviter.sharedEventId } }
          );
        } else {
          // Partner has no guests, let's create copies of the inviter's guests with partner's userId
          // This ensures both users see the same guest list immediately after connecting
          const guestCopies = inviterGuests.map(guest => ({
            userId: partner._id,
            sharedEventId: inviter.sharedEventId,
            name: guest.name,
            phoneNumber: guest.phoneNumber,
            numberOfGuests: guest.numberOfGuests,
            side: guest.side,
            isConfirmed: guest.isConfirmed,
            notes: guest.notes,
            createdAt: new Date(),
            updatedAt: new Date()
          }));
          
          if (guestCopies.length > 0) {
            // Use insertMany to efficiently insert all guests at once
            try {
              await Guest.insertMany(guestCopies);
              console.log(`Created ${guestCopies.length} guest copies for partner`);
            } catch (insertError) {
              console.error('Error creating guest copies:', insertError);
            }
          }
        }
      } catch (error) {
        console.error('Error updating guest list data:', error);
        // Continue execution even if there's an error with guest list synchronization
      }
    }
    
    // Synchronize checklist data is handled in the wedding-checklist API
    // When the partner accesses their checklist, they'll get the main user's data

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      user: partner
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { message: 'Error accepting invitation', error: (error as Error).message },
      { status: 500 }
    );
  }
} 