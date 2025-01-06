import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';

// Define the preferences schema
const weddingPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  venueType: {
    type: String,
    enum: ['garden', 'nature', ''],
    default: ''
  },
  timeOfDay: {
    type: String,
    enum: ['evening', 'afternoon', ''],
    default: ''
  },
  location: {
    type: String,
    enum: ['south', 'center', 'north', ''],
    default: ''
  },
  guestsCount: {
    type: String,
    default: ''
  },
  estimatedBudget: {
    type: String,
    default: ''
  }
});

// Create or get the model
const WeddingPreferences = mongoose.models.WeddingPreferences || mongoose.model('WeddingPreferences', weddingPreferencesSchema);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Find the preferences for the user
    const preferences = await WeddingPreferences.findOne({ userId: params.id });
    
    if (!preferences) {
      // If no preferences exist, return default values
      return NextResponse.json({
        success: true,
        preferences: {
          venueType: '',
          timeOfDay: '',
          location: '',
          guestsCount: '',
          estimatedBudget: ''
        }
      });
    }

    return NextResponse.json({ success: true, preferences });
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

    // Validate the user exists
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update or create the preferences
    const preferences = await WeddingPreferences.findOneAndUpdate(
      { userId: params.id },
      {
        userId: params.id,
        venueType: data.venueType,
        timeOfDay: data.timeOfDay,
        location: data.location,
        guestsCount: data.guestsCount,
        estimatedBudget: data.estimatedBudget
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Error saving wedding preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save wedding preferences' },
      { status: 500 }
    );
  }
} 