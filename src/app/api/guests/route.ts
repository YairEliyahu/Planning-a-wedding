import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Guest from '@/models/Guest';

// GET /api/guests - Get all guests for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Get the user ID from the query parameters
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Fetch the guests for the user
    const guests = await Guest.find({ userId });

    return NextResponse.json({ guests });
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json(
      { message: 'Failed to fetch guests' },
      { status: 500 }
    );
  }
}

// POST /api/guests - Create a new guest for the authenticated user
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { userId, name, phoneNumber, numberOfGuests, side, isConfirmed, notes } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { message: 'User ID and guest name are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Create a new guest
    const guest = await Guest.create({
      userId,
      name,
      phoneNumber,
      numberOfGuests: numberOfGuests !== undefined && numberOfGuests !== null ? numberOfGuests : 1,
      side: side || 'משותף',
      isConfirmed: isConfirmed === undefined ? null : isConfirmed,
      notes: notes || ''
    });

    return NextResponse.json({ guest }, { status: 201 });
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { message: 'Failed to create guest' },
      { status: 500 }
    );
  }
}
