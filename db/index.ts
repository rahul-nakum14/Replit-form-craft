import { connectToMongoDB } from './mongodb';

// Initialize connection to MongoDB
connectToMongoDB()
  .then(() => console.log('MongoDB connection initialized'))
  .catch(err => console.error('Error initializing MongoDB connection:', err));

// Export models
export * from './models';