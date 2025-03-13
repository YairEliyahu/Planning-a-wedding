import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Guest from '@/models/Guest';

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
    console.error('Error fetching guest:', error);
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

    // Update the guest
    const updatedGuest = await Guest.findByIdAndUpdate(
      guestId,
      {
        name: body.name,
        phoneNumber: body.phoneNumber,
        numberOfGuests: body.numberOfGuests,
        side: body.side,
        isConfirmed: body.isConfirmed,
        notes: body.notes,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ guest: updatedGuest });
  } catch (error) {
    console.error('Error updating guest:', error);
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

    // Delete the guest
    await Guest.findByIdAndDelete(guestId);

    return NextResponse.json(
      { message: 'Guest deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json(
      { message: 'Failed to delete guest' },
      { status: 500 }
    );
  }
}
