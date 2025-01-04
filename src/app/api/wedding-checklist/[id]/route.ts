import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';

// Define the checklist schema
const checklistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    id: String,
    name: String,
    budget: String,
    isCompleted: Boolean,
    category: {
      type: String,
      enum: ['vendors', 'attire', 'ceremony', 'other']
    }
  }],
  totalBudget: String
});

// Create or get the model
const Checklist = mongoose.models.Checklist || mongoose.model('Checklist', checklistSchema);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Find the checklist for the user
    const checklist = await Checklist.findOne({ userId: params.id });
    
    if (!checklist) {
      // If no checklist exists, return a default one
      return NextResponse.json({
        success: true,
        checklist: {
          userId: params.id,
          items: [
            // ספקים
            { id: '1', name: 'אולם/גן אירועים', budget: '', isCompleted: false, category: 'vendors' },
            { id: '2', name: 'קייטרינג', budget: '', isCompleted: false, category: 'vendors' },
            { id: '3', name: 'צלם', budget: '', isCompleted: false, category: 'vendors' },
            { id: '4', name: 'צלם וידאו', budget: '', isCompleted: false, category: 'vendors' },
            { id: '5', name: 'תקליטן/להקה', budget: '', isCompleted: false, category: 'vendors' },
            { id: '6', name: 'עיצוב ופרחים', budget: '', isCompleted: false, category: 'vendors' },
            
            // לבוש ואביזרים
            { id: '7', name: 'שמלת כלה', budget: '', isCompleted: false, category: 'attire' },
            { id: '8', name: 'חליפת חתן', budget: '', isCompleted: false, category: 'attire' },
            { id: '9', name: 'טבעות', budget: '', isCompleted: false, category: 'attire' },
            { id: '10', name: 'תכשיטים ואקססוריז', budget: '', isCompleted: false, category: 'attire' },
            
            // טקס
            { id: '11', name: 'רב', budget: '', isCompleted: false, category: 'ceremony' },
            { id: '12', name: 'חופה', budget: '', isCompleted: false, category: 'ceremony' },
            
            // שונות
            { id: '13', name: 'הזמנות', budget: '', isCompleted: false, category: 'other' },
            { id: '14', name: 'מתנות לאורחים', budget: '', isCompleted: false, category: 'other' },
            { id: '15', name: 'הסעות', budget: '', isCompleted: false, category: 'other' },
          ],
          totalBudget: '0'
        }
      });
    }

    return NextResponse.json({ success: true, checklist });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch checklist' },
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

    // Update or create the checklist
    const checklist = await Checklist.findOneAndUpdate(
      { userId: params.id },
      {
        userId: params.id,
        items: data.items,
        totalBudget: data.totalBudget
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, checklist });
  } catch (error) {
    console.error('Error saving checklist:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save checklist' },
      { status: 500 }
    );
  }
} 