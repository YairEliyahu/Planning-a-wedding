import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import mongoose from 'mongoose';

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic';

// Simple schema for storing sync updates
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

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const sharedEventId = searchParams.get('sharedEventId');
    const since = searchParams.get('since');

    if (!sharedEventId) {
      return NextResponse.json({ error: 'Missing sharedEventId' }, { status: 400 });
    }

    const sinceTime = since ? parseInt(since) : 0;

    // מצא עדכונים חדשים מאז הפעם האחרונה
    const updates = await SyncUpdate.find({
      sharedEventId,
      timestamp: { $gt: sinceTime },
      processed: false
    }).sort({ timestamp: 1 }).limit(50);

    // סמן עדכונים כמעובדים
    const updateIds = updates.map(u => u._id);
    if (updateIds.length > 0) {
      await SyncUpdate.updateMany(
        { _id: { $in: updateIds } },
        { processed: true }
      );
    }

    return NextResponse.json(updates);

  } catch (error) {
    console.error('Error checking sync updates:', error);
    return NextResponse.json(
      { error: 'Failed to check updates' }, 
      { status: 500 }
    );
  }
} 