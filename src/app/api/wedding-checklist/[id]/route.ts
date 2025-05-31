import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../utils/dbConnect';
import User from '../../../../models/User';

// ✅ הגדרות אופטימליות
const opts = {
  bufferCommands: false,        // תגובה מהירה לשגיאות
  connectTimeoutMS: 10000,      // 10 שניות מקסימום לחיבור
  maxPoolSize: 10,              // עד 10 חיבורים במקביל
  serverSelectionTimeoutMS: 5000 // בחירת שרת תוך 5 שניות
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    
    const checklist = await db.collection('checklists').findOne({ userId: params.id });
    
    return NextResponse.json({ checklist: checklist?.categories || [] });
  } catch (error) {
    console.error('Failed to fetch checklist:', error);
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { categories } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    // Check if user has a connected account
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update the user's checklist
    await db.collection('checklists').updateOne(
      { userId: params.id },
      { 
        $set: { 
          categories,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    // If user has a sharedEventId and connectedUserId, sync with the partner regardless of who is the main owner
    if (user.sharedEventId && user.connectedUserId) {
      const connectedUserId = user.connectedUserId.toString();
      console.log(`Syncing checklist with connected user: ${connectedUserId}`);
      
      // Check if partner already has a checklist
      const partnerChecklist = await db.collection('checklists').findOne({ userId: connectedUserId });
      
      if (partnerChecklist) {
        // Update the partner's checklist to match
        await db.collection('checklists').updateOne(
          { userId: connectedUserId },
          { 
            $set: { 
              categories,
              updatedAt: new Date()
            }
          }
        );
      } else {
        // Create a new checklist for the partner with the same data
        await db.collection('checklists').insertOne({
          userId: connectedUserId,
          categories,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log('Successfully synced checklist with connected user');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update checklist:', error);
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
} 