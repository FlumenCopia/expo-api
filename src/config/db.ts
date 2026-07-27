import mongoose from 'mongoose';

export const connectDB = async (): Promise<typeof mongoose> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/masters_expo_db';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
};
