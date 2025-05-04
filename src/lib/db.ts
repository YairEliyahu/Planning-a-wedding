import mongoose from 'mongoose';

// Track connection status
let isConnected = false;

/**
 * Connect to MongoDB via mongoose
 */
const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    // Connect using mongoose
    await mongoose.connect(uri);
    
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectDB; 