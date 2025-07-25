import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import mongoose from 'mongoose';

// Mark this route as dynamic since it uses request body
export const dynamic = 'force-dynamic';

// Reuse the same schema as check-updates
const SyncUpdateSchema = new mongoose.Schema({
  sharedEventId: { type: String, required: true },
  userId: { type: String, required: true },
  type: { type: String, required: true },
  action: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Number, required: true },
  processed: { type: Boolean, default: false }
});

const SyncUpdate = mongoose.models.SyncUpdate || mongoose.model('SyncUpdate', SyncUpdateSchema);

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { sharedEventId, userId, type, action, data, timestamp } = body;

    if (!sharedEventId || !userId || !type || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // שמור עדכון לסנכרון עם פרטנר
    const syncUpdate = new SyncUpdate({
      sharedEventId,
      userId,
      type,
      action,
      data,
      timestamp: timestamp || Date.now(),
      processed: false
    });

    await syncUpdate.save();

    console.log(`📤 Stored sync update for sharedEventId: ${sharedEventId}`);

    return NextResponse.json({ 
      success: true,
      updateId: syncUpdate._id
    });

  } catch (error) {
    console.error('Error storing sync update:', error);
    return NextResponse.json(
      { error: 'Failed to store update' }, 
      { status: 500 }
    );
  }
} 