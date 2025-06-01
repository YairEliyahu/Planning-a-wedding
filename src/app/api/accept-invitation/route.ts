import { NextResponse } from 'next/server';
import connectToDatabase from '../../../utils/dbConnect';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import Guest from '../../../models/Guest';

interface DecodedInvitationToken {
  inviterId: string;
  partnerEmail: string;
  partnerName?: string;
  partnerPhone?: string;
  type: string;
}

export async function POST(request: Request) {
  try {
    const { token, newUserId } = await request.json();

    if (!token || !newUserId) {
      return NextResponse.json(
        { success: false, message: 'נתונים חסרים' },
        { status: 400 }
      );
    }

    // חיבור למסד הנתונים
    await connectToDatabase();

    // אימות הטוקן
    let decoded: DecodedInvitationToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedInvitationToken;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'הטוקן אינו תקף או שפג תוקפו' },
        { status: 401 }
      );
    }

    // מציאת המשתמש המזמין
    const inviter = await User.findById(decoded.inviterId);
    if (!inviter) {
      return NextResponse.json(
        { success: false, message: 'המשתמש המזמין לא נמצא' },
        { status: 404 }
      );
    }

    // מציאת המשתמש החדש
    const newUser = await User.findById(newUserId);
    if (!newUser) {
      return NextResponse.json(
        { success: false, message: 'המשתמש החדש לא נמצא' },
        { status: 404 }
      );
    }

    // בדיקה שהאימייל תואם
    if (newUser.email !== decoded.partnerEmail) {
      return NextResponse.json(
        { success: false, message: 'כתובת האימייל לא תואמת להזמנה' },
        { status: 400 }
      );
    }

    // עדכון החיבור בין המשתמשים
    inviter.connectedUserId = newUserId;
    newUser.connectedUserId = decoded.inviterId;

    // סנכרון נתוני החתונה מהמזמין לחדש
    const syncFields = [
      'weddingDate', 'expectedGuests', 'weddingLocation', 'budget', 
      'preferences', 'venueType', 'timeOfDay', 'locationPreference'
    ];

    syncFields.forEach(field => {
      if (inviter[field] !== undefined) {
        newUser[field] = inviter[field];
      }
    });

    // עדכון השדות הפרטיים של השותף בשני המשתמשים
    inviter.partnerName = newUser.fullName;
    inviter.partnerPhone = newUser.phone;
    inviter.partnerEmail = newUser.email;

    newUser.partnerName = inviter.fullName;
    newUser.partnerPhone = inviter.phone;
    newUser.partnerEmail = inviter.email;

    // שמירת השינויים
    await inviter.save();
    await newUser.save();

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
        const partnerGuests = await Guest.find({ userId: newUser._id });
        
        if (partnerGuests.length > 0) {
          // Update partner's guests to have the same shared event ID
          await Guest.updateMany(
            { userId: newUser._id },
            { $set: { sharedEventId: inviter.sharedEventId } }
          );
        } else {
          // Partner has no guests, let's create copies of the inviter's guests with partner's userId
          // This ensures both users see the same guest list immediately after connecting
          const guestCopies = inviterGuests.map(guest => ({
            userId: newUser._id,
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
      message: 'ההזמנה התקבלה בהצלחה! החשבונות מחוברים עכשיו.'
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { success: false, message: 'שגיאה בקבלת ההזמנה' },
      { status: 500 }
    );
  }
} 