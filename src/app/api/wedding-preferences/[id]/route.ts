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

    // מצא את העדפות החתונה של המשתמש
    const preferences = await WeddingPreferences.findOne({ userId: params.id });
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // החזר את העדפות החתונה בפורמט הנדרש
    const response = {
      venueType: preferences?.venueType || '',
      timeOfDay: preferences?.timeOfDay || '',
      locationPreference: preferences?.location || '',
      guestsCount: user.expectedGuests || '',
      estimatedBudget: user.budget || ''
    };

    return NextResponse.json({ success: true, preferences: response });
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

    // נסה למצוא העדפות קיימות
    let preferences = await WeddingPreferences.findOne({ userId: params.id });

    if (preferences) {
      // עדכן את ההעדפות הקיימות
      preferences.venueType = data.venueType;
      preferences.timeOfDay = data.timeOfDay;
      preferences.location = data.locationPreference;
      await preferences.save();
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

    // קבל את נתוני המשתמש לשדות הנוספים
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // עדכן את המשתמש עם השדות שהם חלק מפרופיל המשתמש
    user.expectedGuests = data.guestsCount || user.expectedGuests;
    user.budget = data.estimatedBudget || user.budget;
    await user.save();

    // אם יש קישור למשתמש אחר, סנכרן גם את פרטי החתונה שלו
    if (user.connectedUserId) {
      try {
        console.log(`Syncing wedding preferences with connected user: ${user.connectedUserId}`);
        
        // עדכן את המשתמש המקושר
        const connectedUser = await User.findById(user.connectedUserId);
        if (connectedUser) {
          // סנכרן שדות מהמשתמש הנוכחי למשתמש המקושר
          connectedUser.expectedGuests = user.expectedGuests;
          connectedUser.budget = user.budget;
          await connectedUser.save();

          // מצא או צור העדפות עבור המשתמש המקושר
          const connectedPreferences = await WeddingPreferences.findOne({ userId: connectedUser._id });
          
          if (connectedPreferences) {
            // עדכן את ההעדפות הקיימות של השותף
            connectedPreferences.venueType = preferences.venueType;
            connectedPreferences.timeOfDay = preferences.timeOfDay;
            connectedPreferences.location = preferences.location;
            await connectedPreferences.save();
          } else {
            // צור העדפות חדשות עבור השותף
            await WeddingPreferences.create({
              userId: connectedUser._id,
              venueType: preferences.venueType,
              timeOfDay: preferences.timeOfDay,
              location: preferences.location
            });
          }
          
          console.log('Successfully synced wedding preferences with connected user');
        }
      } catch (syncError) {
        console.error('Error syncing wedding preferences with connected user:', syncError);
        // המשך בביצוע גם אם הסנכרון נכשל
      }
    }

    // החזר את התשובה בפורמט הנדרש
    const response = {
      venueType: preferences.venueType,
      timeOfDay: preferences.timeOfDay,
      locationPreference: preferences.location,
      guestsCount: user.expectedGuests || '',
      estimatedBudget: user.budget || ''
    };

    return NextResponse.json({ success: true, preferences: response });
  } catch (error) {
    console.error('Error saving wedding preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save wedding preferences' },
      { status: 500 }
    );
  }
} 