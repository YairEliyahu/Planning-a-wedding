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