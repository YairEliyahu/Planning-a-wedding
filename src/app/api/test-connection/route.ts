import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing database connection...');
    await connectToDatabase();
    
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return NextResponse.json({
      status: 'success',
      connectionState: stateMap[connectionState as keyof typeof stateMap],
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 