import { NextRequest, NextResponse } from 'next/server';
import { Table } from '@/models/Table';
import User from '@/models/User';
import connectToDatabase from '@/utils/dbConnect';

// POST - הוספת שולחן חדש
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, eventId, name, capacity, shape, position, color, notes } = body;

    if (!userId || !name || !capacity) {
      return NextResponse.json(
        { success: false, error: 'User ID, name, and capacity are required' },
        { status: 400 }
      );
    }

    // Get user to check for shared event
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const tableData: any = {
      name: name.trim(),
      capacity: parseInt(capacity),
      shape: shape || 'round',
      position: position || { x: 0, y: 0 },
      color: color || '#f59e0b',
      notes: notes || '',
      assignments: []
    };

    if (user.sharedEventId) {
      tableData.eventId = user.sharedEventId;
      tableData.userId = userId; // Keep userId for reference
    } else {
      tableData.userId = userId;
      if (eventId) {
        tableData.eventId = eventId;
      }
    }

    const newTable = await Table.create(tableData);

    return NextResponse.json({
      success: true,
      data: {
        table: {
          id: (newTable as any)._id.toString(),
          name: newTable.name,
          capacity: newTable.capacity,
          shape: newTable.shape,
          x: newTable.position.x,
          y: newTable.position.y,
          color: newTable.color,
          notes: newTable.notes,
          guests: []
        },
        message: 'השולחן נוצר בהצלחה!'
      }
    });

  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create table' },
      { status: 500 }
    );
  }
}

// PUT - עדכון שולחן קיים
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { tableId, userId, updates } = body;

    if (!tableId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Table ID and User ID are required' },
        { status: 400 }
      );
    }

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

    // Update allowed fields
    const allowedUpdates = ['name', 'capacity', 'shape', 'position', 'color', 'notes'];
    for (const field of allowedUpdates) {
      if (updates[field] !== undefined) {
        if (field === 'position') {
          table.position = updates[field];
        } else {
          (table as any)[field] = updates[field];
        }
      }
    }

    const updatedTable = await table.save();

    return NextResponse.json({
      success: true,
      data: {
        table: {
          id: (updatedTable as any)._id.toString(),
          name: updatedTable.name,
          capacity: updatedTable.capacity,
          shape: updatedTable.shape,
          x: updatedTable.position.x,
          y: updatedTable.position.y,
          color: updatedTable.color,
          notes: updatedTable.notes,
          guests: updatedTable.assignments.map((assignment: any) => ({
            _id: assignment.guestId.toString(),
            seatNumber: assignment.seatNumber,
            assignedAt: assignment.assignedAt
          }))
        },
        message: 'השולחן עודכן בהצלחה!'
      }
    });

  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

// DELETE - מחיקת שולחן
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const userId = searchParams.get('userId');

    if (!tableId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Table ID and User ID are required' },
        { status: 400 }
      );
    }

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

    // Soft delete - mark as inactive instead of removing
    table.isActive = false;
    await table.save();

    return NextResponse.json({
      success: true,
      data: {
        message: 'השולחן נמחק בהצלחה!'
      }
    });

  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete table' },
      { status: 500 }
    );
  }
} 