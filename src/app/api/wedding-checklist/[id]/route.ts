import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../utils/dbConnect';
import User from '../../../../models/User';
import clientPromise from '@/lib/mongodb';
import { defaultCategories } from '../../../user/[id]/checklist/constants/defaultData';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const user = await User.findById(params.id).lean().exec();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    let checklist = await db.collection('checklists')
      .findOne(
        { userId: params.id },
        { projection: { categories: 1, _id: 0 } }
      );
    
    // אם אין צ'ק ליסט קיים, צור אחד חדש עם נתונים בסיסיים נקיים
    if (!checklist || !checklist.categories || checklist.categories.length === 0) {
      console.log(`Creating new clean checklist for user ${params.id}`);
      
      // יצירת נתונים בסיסיים נקיים (ללא budget או completion)
      const cleanCategories = defaultCategories.map(category => ({
        ...category,
        items: category.items.map(item => ({
          ...item,
          isCompleted: false,
          budget: '',
          guestCount: 0,
          averageGift: 0,
          costPerPerson: 0
        }))
      }));
      
      const newChecklistData = {
        userId: params.id,
        categories: cleanCategories,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('checklists').insertOne(newChecklistData);
      checklist = { categories: cleanCategories, _id: null as any };
    }
    
    return NextResponse.json({ checklist: checklist?.categories || [] }, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'Last-Modified': new Date().toUTCString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch checklist:', error);
    
    // במקרה של שגיאה, החזר נתונים בסיסיים נקיים
    const cleanCategories = defaultCategories.map(category => ({
      ...category,
      items: category.items.map(item => ({
        ...item,
        isCompleted: false,
        budget: '',
        guestCount: 0,
        averageGift: 0,
        costPerPerson: 0
      }))
    }));
    
    return NextResponse.json({ checklist: cleanCategories }, {
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
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
    
    if ((user as any).sharedEventId && (user as any).connectedUserId) {
      const connectedUserId = (user as any).connectedUserId.toString();
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
    
    if ((user as any).sharedEventId && (user as any).connectedUserId) {
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