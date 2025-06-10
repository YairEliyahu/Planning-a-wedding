import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Guest from '@/models/Guest';
import mongoose from 'mongoose';

// GET /api/guests/[id] - Get a specific guest by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const guestId = params.id;
    const guest = await Guest.findById(guestId);

    if (!guest) {
      return NextResponse.json(
        { message: 'Guest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ guest });
  } catch (error) {
    console.error('[GUEST API] Error fetching guest:', error);
    return NextResponse.json(
      { message: 'Failed to fetch guest' },
      { status: 500 }
    );
  }
}

// PUT /api/guests/[id] - Update a specific guest
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guestId = params.id;
    const body = await req.json();
    
    await dbConnect();

    // Find the guest
    const existingGuest = await Guest.findById(guestId);
    if (!existingGuest) {
      return NextResponse.json(
        { message: 'Guest not found' },
        { status: 404 }
      );
    }

    // Check if the user has a shared event
    const user = await mongoose.models.User.findById(existingGuest.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Define update data with proper typing to include optional sharedEventId
    const updateData: {
      name: string;
      phoneNumber?: string;
      numberOfGuests: number;
      side: string;
      isConfirmed: boolean | null;
      notes: string;
      group?: string;
      updatedAt: Date;
      sharedEventId?: string;
    } = {
      name: body.name,
      phoneNumber: body.phoneNumber,
      numberOfGuests: body.numberOfGuests,
      side: body.side,
      isConfirmed: body.isConfirmed,
      notes: body.notes,
      group: body.group || '',
      updatedAt: new Date()
    };

    // Always add sharedEventId if the user has one, even if guest already has it
    // This guarantees consistent data across partners
    if (user.sharedEventId) {
      console.log(`[GUEST API] Updating guest ${guestId} with sharedEventId ${user.sharedEventId}`);
      updateData.sharedEventId = user.sharedEventId;
    }

    // Update the guest
    const updatedGuest = await Guest.findByIdAndUpdate(
      guestId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedGuest) {
      return NextResponse.json(
        { message: 'Failed to update guest' },
        { status: 500 }
      );
    }

    // Verify sharedEventId propagation
    if (user.sharedEventId && (!updatedGuest.sharedEventId || updatedGuest.sharedEventId !== user.sharedEventId)) {
      console.log(`[GUEST API] Forcing sharedEventId update for guest ${guestId}`);
      updatedGuest.sharedEventId = user.sharedEventId;
      await updatedGuest.save();
    }

    // If this is a shared account, sync the changes to the connected user's guest copy
    if (user.connectedUserId && user.sharedEventId) {
      try {
        console.log(`[GUEST API] Syncing guest update to connected user ${user.connectedUserId}`);
        
        // First check if a copy already exists - by sharedEventId and name
        const connectedGuestCopy = await Guest.findOne({
          name: updateData.name,
          userId: new mongoose.Types.ObjectId(user.connectedUserId),
          sharedEventId: user.sharedEventId
        });

        if (connectedGuestCopy) {
          // Update the existing copy
          console.log(`[GUEST API] Updating connected user's guest copy: ${connectedGuestCopy._id}`);
          
          // Update all fields from the original guest - type-safe approach
          connectedGuestCopy.name = updateData.name;
          connectedGuestCopy.phoneNumber = updateData.phoneNumber;
          connectedGuestCopy.numberOfGuests = updateData.numberOfGuests;
          connectedGuestCopy.side = updateData.side as 'חתן' | 'כלה' | 'משותף';
          connectedGuestCopy.isConfirmed = updateData.isConfirmed;
          connectedGuestCopy.notes = updateData.notes;
          connectedGuestCopy.group = updateData.group || '';
          connectedGuestCopy.sharedEventId = user.sharedEventId;
          connectedGuestCopy.updatedAt = new Date();
          
          await connectedGuestCopy.save();
          console.log('[GUEST API] Successfully updated connected guest copy');
        } else {
          // Create a new copy for the connected user
          console.log('[GUEST API] Creating new copy of guest for connected user');
          
          const newCopy = new Guest({
            ...updateData,
            userId: new mongoose.Types.ObjectId(user.connectedUserId),
            sharedEventId: user.sharedEventId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await newCopy.save();
          console.log(`[GUEST API] Successfully created new guest copy with ID ${newCopy._id}`);
        }
      } catch (syncError) {
        console.error(`[GUEST API] Error syncing guest to connected user: ${syncError}`);
        // Continue execution even if sync fails
      }
    }

    return NextResponse.json({ guest: updatedGuest });
  } catch (error) {
    console.error('[GUEST API] Error updating guest:', error);
    return NextResponse.json(
      { message: 'Failed to update guest' },
      { status: 500 }
    );
  }
}

// DELETE /api/guests/[id] - Delete a specific guest
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guestId = params.id;
    
    await dbConnect();

    // Find the guest
    const existingGuest = await Guest.findById(guestId);
    if (!existingGuest) {
      return NextResponse.json(
        { message: 'Guest not found' },
        { status: 404 }
      );
    }

    // If this is a shared guest, need to handle the connected user's copy
    const user = await mongoose.models.User.findById(existingGuest.userId);
    if (user && user.connectedUserId && existingGuest.sharedEventId) {
      try {
        // Try to find and delete connected user's copy based on name and sharedEventId
        const deleteResult = await Guest.deleteOne({
          name: existingGuest.name,
          userId: new mongoose.Types.ObjectId(user.connectedUserId),
          sharedEventId: existingGuest.sharedEventId
        });
        
        console.log(`[GUEST API] Deleted ${deleteResult.deletedCount} connected guest copy`);
      } catch (deleteError) {
        console.error(`[GUEST API] Error deleting connected guest copy: ${deleteError}`);
        // Continue execution even if delete fails
      }
    }

    // Delete the guest
    await Guest.findByIdAndDelete(guestId);

    return NextResponse.json(
      { message: 'Guest deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GUEST API] Error deleting guest:', error);
    return NextResponse.json(
      { message: 'Failed to delete guest' },
      { status: 500 }
    );
  }
}
