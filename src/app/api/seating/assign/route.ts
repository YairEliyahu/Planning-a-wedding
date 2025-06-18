import { NextRequest, NextResponse } from 'next/server';
import { Table } from '@/models/Table';
import Guest from '@/models/Guest';
import connectToDatabase from '@/utils/dbConnect';

// POST - השבת אורח לשולחן
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, guestId, tableId, seatNumber } = body;

    if (!userId || !guestId || !tableId) {
      return NextResponse.json(
        { success: false, error: 'User ID, Guest ID, and Table ID are required' },
        { status: 400 }
      );
    }

    // Verify guest exists and belongs to user
    const guest = await Guest.findOne({ _id: guestId, userId });
    if (!guest) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Check if guest is confirmed
    if (!guest.isConfirmed) {
      return NextResponse.json(
        { success: false, error: 'ניתן להושיב רק אורחים שאישרו הגעה!' },
        { status: 400 }
      );
    }

    // Find target table
    const targetTable = await Table.findOne({ 
      _id: tableId, 
      userId,
      isActive: true 
    });
    
    if (!targetTable) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      );
    }

    // Check table capacity
    if (targetTable.assignments.length >= targetTable.capacity) {
      return NextResponse.json(
        { success: false, error: 'השולחן מלא! לא ניתן להוסיף עוד אורחים' },
        { status: 400 }
      );
    }

    // Remove guest from any existing table assignment
    await Table.updateMany(
      { userId, isActive: true },
      { $pull: { assignments: { guestId: guestId } } }
    );

    // Add guest to new table
    const newAssignment = {
      guestId: guestId,
      seatNumber: seatNumber || null,
      assignedAt: new Date()
    };

    targetTable.assignments.push(newAssignment);
    await targetTable.save();

    return NextResponse.json({
      success: true,
      data: {
        message: `${guest.name} הוקצה לשולחן ${targetTable.name}`,
        assignment: {
          guestId,
          tableId,
          seatNumber,
          assignedAt: newAssignment.assignedAt
        }
      }
    });

  } catch (error) {
    console.error('Error assigning guest to table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign guest to table' },
      { status: 500 }
    );
  }
}

// DELETE - הסרת אורח משולחן
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const guestId = searchParams.get('guestId');

    if (!userId || !guestId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Guest ID are required' },
        { status: 400 }
      );
    }

    // Verify guest exists and belongs to user
    const guest = await Guest.findOne({ _id: guestId, userId });
    if (!guest) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Remove guest from all table assignments
    const result = await Table.updateMany(
      { userId, isActive: true },
      { $pull: { assignments: { guestId: guestId } } }
    );

    return NextResponse.json({
      success: true,
      data: {
        message: `${guest.name} הוסר מהשולחן`,
        modifiedTables: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error removing guest from table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove guest from table' },
      { status: 500 }
    );
  }
}

// PUT - עדכון מקום האורח בשולחן
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, guestId, tableId, seatNumber } = body;

    if (!userId || !guestId || !tableId) {
      return NextResponse.json(
        { success: false, error: 'User ID, Guest ID, and Table ID are required' },
        { status: 400 }
      );
    }

    // Find the table and update seat number
    const table = await Table.findOne({ 
      _id: tableId, 
      userId,
      isActive: true 
    });

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      );
    }

    // Find and update the assignment
    const assignment = table.assignments.find(a => a.guestId.toString() === guestId);
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Guest assignment not found in this table' },
        { status: 404 }
      );
    }

    assignment.seatNumber = seatNumber;
    await table.save();

    return NextResponse.json({
      success: true,
      data: {
        message: 'מקום האורח עודכן בהצלחה',
        assignment: {
          guestId,
          tableId,
          seatNumber
        }
      }
    });

  } catch (error) {
    console.error('Error updating guest seat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update guest seat' },
      { status: 500 }
    );
  }
} 