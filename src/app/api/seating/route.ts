import { NextRequest, NextResponse } from 'next/server';
import { Table, SeatingArrangement } from '@/models/Table';
import User from '@/models/User';
import connectToDatabase from '@/utils/dbConnect';

// מטמון עבור סידורי הושבה
const seatingCache = new Map<string, { 
  data: any; 
  timestamp: number; 
  etag: string;
}>();
const CACHE_TTL = 3 * 60 * 1000; // 3 דקות

// פונקציה ליצירת ETag
function generateSeatingETag(arrangement: any, tables: any[]): string {
  const arrangeUpdated = arrangement?.updatedAt?.getTime() || 0;
  const tablesUpdated = tables.length > 0 ? 
    Math.max(...tables.map(t => t.updatedAt?.getTime() || 0)) : 0;
  const maxUpdated = Math.max(arrangeUpdated, tablesUpdated);
  return `"seating-${maxUpdated}-${tables.length}"`;
}

// GET - קבלת כל הסידורים והשולחנות של המשתמש (תומך במשתמשים משותפים)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const clientETag = request.headers.get('if-none-match');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // בדיקת מטמון
    const cacheKey = `seating-${userId}-${eventId || 'default'}`;
    const cachedData = seatingCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      if (clientETag && clientETag === cachedData.etag) {
        return new NextResponse(null, { status: 304 });
      }
      
      return NextResponse.json(cachedData.data, {
        headers: {
          'ETag': cachedData.etag,
          'Cache-Control': 'public, max-age=180'
        }
      });
    }

    await connectToDatabase();

    // Get user with optimized projection
    const user = await User.findById(userId)
      .select('sharedEventId')
      .lean();
      
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build optimized queries
    const baseQuery: any = { isActive: true };
    const effectiveEventId = user.sharedEventId || eventId;
    
    if (effectiveEventId) {
      baseQuery.eventId = effectiveEventId;
    } else {
      baseQuery.userId = userId;
    }

    console.log(`[SEATING API] Query for user ${userId}, eventId: ${effectiveEventId}`);

    // Parallel queries for better performance
    const [arrangement, tables] = await Promise.all([
      SeatingArrangement.findOne({ ...baseQuery, isDefault: true })
        .lean()
        .select('-__v'),
      Table.find(baseQuery)
        .populate({
          path: 'assignments.guestId',
          select: 'name phoneNumber numberOfGuests side isConfirmed notes group userId'
        })
        .lean()
        .select('-__v')
        .sort({ createdAt: 1 })
    ]);

    // Transform tables efficiently
    const transformedTables = tables.map((table: any) => ({
      id: table._id.toString(),
      name: table.name,
      capacity: table.capacity,
      shape: table.shape,
      x: table.position.x,
      y: table.position.y,
      color: table.color,
      notes: table.notes,
      guests: table.assignments?.map((assignment: any) => ({
        _id: assignment.guestId._id.toString(),
        userId: assignment.guestId.userId,
        name: assignment.guestId.name,
        phoneNumber: assignment.guestId.phoneNumber,
        numberOfGuests: assignment.guestId.numberOfGuests,
        side: assignment.guestId.side,
        isConfirmed: assignment.guestId.isConfirmed,
        notes: assignment.guestId.notes,
        group: assignment.guestId.group,
        tableId: table._id.toString(),
        seatNumber: assignment.seatNumber,
        assignedAt: assignment.assignedAt
      })) || []
    }));

    const responseData = {
      success: true,
      data: {
        arrangement: arrangement || null,
        tables: transformedTables
      }
    };

    // Generate ETag and cache
    const etag = generateSeatingETag(arrangement, tables);
    seatingCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
      etag
    });

    // Clean old cache entries
    const now = Date.now();
    for (const [key, value] of seatingCache.entries()) {
      if (now - value.timestamp > CACHE_TTL * 2) {
        seatingCache.delete(key);
      }
    }

    return NextResponse.json(responseData, {
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=180'
      }
    });

  } catch (error) {
    console.error('Error fetching seating arrangement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seating arrangement' },
      { status: 500 }
    );
  }
}

// POST - שמירת סידור הושבה חדש או עדכון קיים (אופטימיזציה לביצועים)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, eventId, arrangement, tables } = body;

    if (!userId || !tables) {
      return NextResponse.json(
        { success: false, error: 'User ID and tables are required' },
        { status: 400 }
      );
    }

    // Get user info efficiently
    const user = await User.findById(userId)
      .select('sharedEventId')
      .readPreference('primary')
      .lean();
      
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const effectiveEventId = user.sharedEventId || eventId;
    console.log(`[SEATING API] Saving seating for user ${userId}, eventId: ${effectiveEventId}`);

    // Clear cache immediately
    const cacheKey = `seating-${userId}-${eventId || 'default'}`;
    seatingCache.delete(cacheKey);

    // Use transaction for data consistency
    const session = await Table.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Handle arrangement if provided
        if (arrangement) {
          const query: any = { isActive: true, isDefault: true };
          
          if (effectiveEventId) {
            query.eventId = effectiveEventId;
          } else {
            query.userId = userId;
          }

          const existingArrangement = await SeatingArrangement.findOne(query)
            .session(session)
            .readPreference('primary');

          if (existingArrangement) {
            Object.assign(existingArrangement, arrangement, { updatedAt: new Date() });
            await existingArrangement.save({ session });
          } else {
            const arrangementData: any = {
              ...arrangement,
              isDefault: true,
              userId: userId
            };

            if (effectiveEventId) {
              arrangementData.eventId = effectiveEventId;
            }

            await SeatingArrangement.create([arrangementData], { session });
          }
        }

        // Delete existing tables efficiently
        const deleteQuery: any = {};
        
        if (effectiveEventId) {
          deleteQuery.eventId = effectiveEventId;
        } else {
          deleteQuery.userId = userId;
        }

        await Table.deleteMany(deleteQuery)
          .session(session)
          .readPreference('primary');

        // Prepare and save new tables in batch
        const tablesToCreate = tables.map((tableData: any) => {
          const assignments = tableData.guests?.map((guest: any) => ({
            guestId: guest._id,
            seatNumber: guest.seatNumber,
            assignedAt: new Date()
          })) || [];

          const tableDoc: any = {
            userId: userId,
            name: tableData.name,
            capacity: tableData.capacity,
            shape: tableData.shape || 'round',
            position: {
              x: tableData.x || 0,
              y: tableData.y || 0
            },
            assignments,
            color: tableData.color || '#f59e0b',
            notes: tableData.notes || '',
            isActive: true
          };

          if (effectiveEventId) {
            tableDoc.eventId = effectiveEventId;
          }

          return tableDoc;
        });

        if (tablesToCreate.length > 0) {
          await Table.create(tablesToCreate, { session });
        }
      });

      await session.endSession();

      return NextResponse.json({
        success: true,
        message: `Seating arrangement saved successfully with ${tables.length} tables`
      });

    } catch (transactionError) {
      await session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error('Error saving seating arrangement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save seating arrangement' },
      { status: 500 }
    );
  }
} 