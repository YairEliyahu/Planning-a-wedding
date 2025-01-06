import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update checklist:', error);
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
} 