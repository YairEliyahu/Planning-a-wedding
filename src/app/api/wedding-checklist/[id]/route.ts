import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../utils/dbConnect';
import User from '../../../../models/User';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const [user, mongoose] = await Promise.all([
      User.findById(params.id).lean().exec(),
      connectToDatabase()
    ]);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const checklist = await db.collection('checklists')
      .findOne(
        { userId: params.id },
        { projection: { categories: 1, _id: 0 } }
      );
    
    return NextResponse.json({ checklist: checklist?.categories || [] }, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'Last-Modified': new Date().toUTCString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch checklist:', error);
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { categories } = await request.json();
    
    const [client, user] = await Promise.all([
      clientPromise,
      User.findById(params.id).select('sharedEventId connectedUserId').lean().exec()
    ]);
    
    const db = client.db();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const updateData = { 
      categories,
      updatedAt: new Date()
    };
    
    const operations = [
      db.collection('checklists').updateOne(
        { userId: params.id },
        { $set: updateData },
        { upsert: true }
      )
    ];
    
    if (user.sharedEventId && user.connectedUserId) {
      const connectedUserId = user.connectedUserId.toString();
      console.log(`Syncing checklist with connected user: ${connectedUserId}`);
      
      operations.push(
        db.collection('checklists').updateOne(
          { userId: connectedUserId },
          { $set: updateData },
          { upsert: true }
        )
      );
    }
    
    await Promise.all(operations);
    
    if (user.sharedEventId && user.connectedUserId) {
      console.log('Successfully synced checklist with connected user');
    }
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Failed to update checklist:', error);
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
} 