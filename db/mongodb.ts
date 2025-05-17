import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined. Please set the MONGODB_URI environment variable.');
  
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Running in development mode without a MongoDB connection.');
  } else {
    console.error('Cannot run in production without a MongoDB connection.');
    process.exit(1);
  }
}

/**
 * Connect to MongoDB
 * @returns A Promise that resolves to the Mongoose connection
 */
export async function connectToMongoDB() {
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is not defined');
  }

  try {
    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB connection already established');
      return mongoose.connection;
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await disconnectFromMongoDB();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});