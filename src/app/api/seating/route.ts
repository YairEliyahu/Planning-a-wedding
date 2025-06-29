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

// GET - קבלת סידור הושבה קיים
export async function GET(request: NextRequest) {
  try {
    console.log('[SEATING API] GET request started');
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');

    console.log('[SEATING API] Request params:', { userId, eventId });
    
    if (!userId) {
      console.log('[SEATING API] Missing userId parameter');
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `seating-${userId}-${eventId || 'default'}`;
    const cached = seatingCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const etag = request.headers.get('if-none-match');
      if (etag === cached.etag) {
        return new NextResponse(null, { status: 304 });
      }
      return NextResponse.json(cached.data, {
        headers: { 'ETag': cached.etag }
      });
    }

    console.log('[SEATING API] Fetching fresh data from database...');

    // Get user info
    const user = await User.findById(userId).select('sharedEventId');
    if (!user) {
      console.log('[SEATING API] User not found:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const effectiveEventId = (user as any).sharedEventId || eventId;
    console.log('[SEATING API] Using eventId:', effectiveEventId);

    // Build queries
    const baseQuery: any = { isActive: true };
    const arrangementQuery: any = { ...baseQuery, isDefault: true };
    
    if (effectiveEventId) {
      baseQuery.eventId = effectiveEventId;
      arrangementQuery.eventId = effectiveEventId;
    } else {
      baseQuery.userId = userId;
      arrangementQuery.userId = userId;
    }

    console.log('[SEATING API] Database queries:', { baseQuery, arrangementQuery });

    let arrangement, tables;
    
    try {
      // Find tables for the user/event with populated guest data
      [arrangement, tables] = await Promise.all([
        SeatingArrangement.findOne(arrangementQuery)
          .select('name createdBy isDefault mapBackground venueLayout')
          .sort({ createdAt: 1 }),
      Table.find(baseQuery)
        .populate({
          path: 'assignments.guestId',
            select: 'name phoneNumber numberOfGuests side isConfirmed notes group userId',
            match: { _id: { $exists: true } } // Only populate if guest still exists
        })
          .select('name capacity shape position assignments color notes')
        .sort({ createdAt: 1 })
    ]);

      console.log('[SEATING API] Database results:', {
        arrangement: !!arrangement,
        tablesCount: tables.length,
        tablesWithAssignments: tables.filter(t => t.assignments && t.assignments.length > 0).length
      });

    } catch (dbError) {
      console.error('[SEATING API] Database query error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      );
    }

    // Transform tables with better error handling
    const transformedTables = (tables || []).map((table: any) => {
      try {
        const validAssignments = table.assignments?.filter((assignment: any) => {
          return assignment && 
                 assignment.guestId && 
                 assignment.guestId._id && 
                 typeof assignment.guestId._id === 'object';
        }) || [];

        return {
      id: table._id.toString(),
      name: table.name,
      capacity: table.capacity,
      shape: table.shape,
          x: table.position?.x || 0,
          y: table.position?.y || 0,
          color: table.color || '#f59e0b',
          notes: table.notes || '',
          guests: validAssignments.map((assignment: any) => ({
        _id: assignment.guestId._id.toString(),
        userId: assignment.guestId.userId,
            name: assignment.guestId.name || 'אורח לא ידוע',
            phoneNumber: assignment.guestId.phoneNumber || '',
            numberOfGuests: assignment.guestId.numberOfGuests || 1,
            side: assignment.guestId.side || 'משותף',
        isConfirmed: assignment.guestId.isConfirmed,
            notes: assignment.guestId.notes || '',
            group: assignment.guestId.group || '',
        tableId: table._id.toString(),
            seatNumber: assignment.seatNumber || 1,
        assignedAt: assignment.assignedAt
          }))
        };
      } catch (error) {
        console.error('Error transforming table:', table._id, error);
        return {
          id: table._id.toString(),
          name: table.name || 'שולחן',
          capacity: table.capacity || 8,
          shape: table.shape || 'round',
          x: table.position?.x || 0,
          y: table.position?.y || 0,
          color: table.color || '#f59e0b',
          notes: table.notes || '',
          guests: []
        };
      }
    });

    const responseData = {
      success: true,
      data: {
        arrangement: arrangement || null,
        tables: transformedTables
      }
    };

    // Cache the response
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

// POST - שמירת סידור הושבה חדש או עדכון קיים
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, eventId, arrangement, tables } = body;

    console.log('[SEATING API] POST request received:', {
      userId,
      eventId: eventId || 'none',
      tablesCount: tables?.length || 0,
      hasArrangement: !!arrangement
    });

    if (!userId || !tables) {
      return NextResponse.json(
        { success: false, error: 'User ID and tables are required' },
        { status: 400 }
      );
    }

    // Get user info - simplified
    const user = await User.findById(userId).select('sharedEventId');
      
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const effectiveEventId = (user as any).sharedEventId || eventId;
    console.log(`[SEATING API] Saving seating for user ${userId}, effectiveEventId: ${effectiveEventId}`);

    // Clear cache
    const cacheKey = `seating-${userId}-${eventId || 'default'}`;
    seatingCache.delete(cacheKey);
    
    try {
        // Handle arrangement if provided
        if (arrangement) {
          const query: any = { isActive: true, isDefault: true };
          
          if (effectiveEventId) {
            query.eventId = effectiveEventId;
          } else {
            query.userId = userId;
          }

        const existingArrangement = await SeatingArrangement.findOne(query);

          if (existingArrangement) {
            Object.assign(existingArrangement, arrangement, { updatedAt: new Date() });
          await existingArrangement.save();
          } else {
            const arrangementData: any = {
              ...arrangement,
              isDefault: true,
            userId: userId,
            isActive: true
            };

            if (effectiveEventId) {
              arrangementData.eventId = effectiveEventId;
            }

          await SeatingArrangement.create(arrangementData);
          }
        }

      // Delete existing tables
      const deleteQuery: any = { isActive: true };
        
        if (effectiveEventId) {
          deleteQuery.eventId = effectiveEventId;
        } else {
          deleteQuery.userId = userId;
        }

      await Table.deleteMany(deleteQuery);
      console.log('[SEATING API] Deleted existing tables for query:', deleteQuery);

      // Create new tables
        const tablesToCreate = tables.map((tableData: any) => {
          const assignments = tableData.guests?.map((guest: any) => ({
            guestId: guest._id,
          seatNumber: guest.seatNumber || 1,
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
        await Table.insertMany(tablesToCreate);
        console.log(`[SEATING API] Created ${tablesToCreate.length} new tables`);
        }

      return NextResponse.json({
        success: true,
        message: `סידור ההושבה נשמר בהצלחה עם ${tables.length} שולחנות`
      });

    } catch (dbError) {
      console.error('Database error saving seating arrangement:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('Error saving seating arrangement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save seating arrangement' },
      { status: 500 }
    );
  }
} 