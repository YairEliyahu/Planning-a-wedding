import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Guest from '@/models/Guest';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // קבלת פרטי המשתמש
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    let removedCount = 0;

    // אם יש sharedEventId, נקה כפילויות לפי זה
    if (user.sharedEventId) {
      console.log(`[CLEANUP] Cleaning duplicates for sharedEventId: ${user.sharedEventId}`);
      
      // מצא את כל האורחים עבור האירוע המשותף
      const allGuests = await Guest.find({ sharedEventId: user.sharedEventId }).lean();
      
      // צור מפה של אורחים ייחודיים לפי שם
      const uniqueGuests = new Map<string, {
        latestGuest: any;
        duplicates: string[];
      }>();
      
      for (const guest of allGuests) {
        const guestName = guest.name.trim().toLowerCase();
        
        if (!uniqueGuests.has(guestName)) {
          uniqueGuests.set(guestName, {
            latestGuest: guest,
            duplicates: []
          });
        } else {
          const existing = uniqueGuests.get(guestName)!;
          
          // השווה תאריכי עדכון
          if (guest.updatedAt > existing.latestGuest.updatedAt) {
            // האורח הנוכחי חדש יותר - העבר את הקודם לכפילויות
            existing.duplicates.push(existing.latestGuest._id.toString());
            existing.latestGuest = guest;
          } else {
            // האורח הנוכחי ישן יותר - הוסף אותו לכפילויות
            existing.duplicates.push(guest._id.toString());
          }
        }
      }
      
      // מחק את הכפילויות
      for (const [guestName, data] of uniqueGuests) {
        for (const duplicateId of data.duplicates) {
          await Guest.findByIdAndDelete(duplicateId);
          removedCount++;
          console.log(`[CLEANUP] Removed duplicate: ${guestName} (ID: ${duplicateId})`);
        }
      }
    } else {
      // אם אין sharedEventId, נקה כפילויות רק לפי userId
      console.log(`[CLEANUP] Cleaning duplicates for userId: ${userId}`);
      
      const userGuests = await Guest.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();
      
      const uniqueGuests = new Map<string, {
        latestGuest: any;
        duplicates: string[];
      }>();
      
      for (const guest of userGuests) {
        const guestName = guest.name.trim().toLowerCase();
        
        if (!uniqueGuests.has(guestName)) {
          uniqueGuests.set(guestName, {
            latestGuest: guest,
            duplicates: []
          });
        } else {
          const existing = uniqueGuests.get(guestName)!;
          
          if (guest.updatedAt > existing.latestGuest.updatedAt) {
            existing.duplicates.push(existing.latestGuest._id.toString());
            existing.latestGuest = guest;
          } else {
            existing.duplicates.push(guest._id.toString());
          }
        }
      }
      
      // מחק את הכפילויות
      for (const [guestName, data] of uniqueGuests) {
        for (const duplicateId of data.duplicates) {
          await Guest.findByIdAndDelete(duplicateId);
          removedCount++;
          console.log(`[CLEANUP] Removed duplicate: ${guestName} (ID: ${duplicateId})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      removedCount,
      message: `Removed ${removedCount} duplicate guests`
    });

  } catch (error) {
    console.error('[CLEANUP] Error:', error);
    return NextResponse.json(
      { message: 'Failed to cleanup duplicates', error: (error as Error).message },
      { status: 500 }
    );
  }
} 