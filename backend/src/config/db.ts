import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function connectDB(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
