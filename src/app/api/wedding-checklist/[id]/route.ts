import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Check if user has a connected account
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // If user has a sharedEventId and is not the main owner, get checklist from the main owner
    if (user.sharedEventId && !user.isMainEventOwner && user.connectedUserId) {
      // Get main user's checklist
      const mainUserChecklist = await db.collection('checklists').findOne({ userId: user.connectedUserId.toString() });
      if (mainUserChecklist) {
        return NextResponse.json({ checklist: mainUserChecklist.categories || [] });
      }
    }
    
    // Otherwise, get the user's own checklist
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