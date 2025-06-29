import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';
import WeddingPreferences from '@/models/WeddingPreferences';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // שיפור: בקשות מקבילות למסד הנתונים
    const [preferences, user] = await Promise.all([
      WeddingPreferences.findOne({ userId: params.id }).lean().exec(),
      User.findById(params.id).select('expectedGuests budget').lean().exec()
    ]);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // החזר את העדפות החתונה בפורמט הנדרש
    const response = {
      venueType: (preferences as any)?.venueType || '',
      timeOfDay: (preferences as any)?.timeOfDay || '',
      locationPreference: (preferences as any)?.location || '',
      guestsCount: (user as any).expectedGuests || '',
      estimatedBudget: (user as any).budget || ''
    };

    return NextResponse.json({ success: true, preferences: response }, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 דקות
        'Last-Modified': new Date().toUTCString()
      }
    });
  } catch (error) {
    console.error('Error fetching wedding preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wedding preferences' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const data = await request.json();

    console.log('Updating wedding preferences for user:', params.id, 'with data:', data);

    // שיפור: בקשות מקבילות לקבלת נתונים ראשוניים
    const [existingPreferences, user] = await Promise.all([
      WeddingPreferences.findOne({ userId: params.id }),
      User.findById(params.id).select('expectedGuests budget connectedUserId')
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    let preferences;

    if (existingPreferences) {
      // עדכן את ההעדפות הקיימות
      existingPreferences.venueType = data.venueType;
      existingPreferences.timeOfDay = data.timeOfDay;
      existingPreferences.location = data.locationPreference;
      preferences = await existingPreferences.save();
    } else {
      // צור העדפות חדשות
      preferences = await WeddingPreferences.create({
        userId: params.id,
        venueType: data.venueType,
        timeOfDay: data.timeOfDay,
        location: data.locationPreference
      });
    }

    console.log('Updated/Created preferences:', preferences);

    // עדכן את המשתמש עם השדות שהם חלק מפרופיל המשתמש
    user.expectedGuests = data.guestsCount || user.expectedGuests;
    user.budget = data.estimatedBudget || user.budget;

    // בנה מערך של פעולות עדכון
    const updateOperations = [
      user.save()
    ];

    // אם יש קישור למשתמש אחר, הכן את פעולות הסנכרון
    if (user.connectedUserId) {
      console.log(`Syncing wedding preferences with connected user: ${user.connectedUserId}`);
      
      updateOperations.push(
        // עדכון המשתמש המקושר
        User.findByIdAndUpdate(
          user.connectedUserId,
          {
            expectedGuests: user.expectedGuests,
            budget: user.budget
          },
          { new: true }
        ),
        // עדכון/יצירת העדפות למשתמש המקושר
        WeddingPreferences.findOneAndUpdate(
          { userId: user.connectedUserId },
          {
            venueType: preferences.venueType,
            timeOfDay: preferences.timeOfDay,
            location: preferences.location
          },
          { 
            new: true,
            upsert: true
          }
        )
      );
    }

    // בצע את כל העדכונים במקביל
    try {
      await Promise.all(updateOperations);
      
      if (user.connectedUserId) {
        console.log('Successfully synced wedding preferences with connected user');
      }
    } catch (syncError) {
      console.error('Error syncing wedding preferences with connected user:', syncError);
      // המשך בביצוע גם אם הסנכרון נכשל
    }

    // החזר את התשובה בפורמט הנדרש
    const response = {
      venueType: preferences.venueType,
      timeOfDay: preferences.timeOfDay,
      locationPreference: preferences.location,
      guestsCount: user.expectedGuests || '',
      estimatedBudget: user.budget || ''
    };

    return NextResponse.json({ success: true, preferences: response }, {
      headers: {
        'Cache-Control': 'no-cache' // לא לשמור במטמון אחרי עדכון
      }
    });
  } catch (error) {
    console.error('Error saving wedding preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save wedding preferences' },
      { status: 500 }
    );
  }
} 