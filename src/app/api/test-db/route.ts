import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing database connection...');
    await connectToDatabase();
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Database connection successful',
      mongooseState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 