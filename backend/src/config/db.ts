import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tamil_heritage_games';
  try {
    // Set connection timeout to 3 seconds for quick fallback
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log('✔ MongoDB Connected Successfully to: ' + MONGO_URI);
    return true;
  } catch (error: any) {
    isMongoConnected = false;
    console.warn('⚠ MongoDB Connection Failed: ', error.message);
    console.warn('ℹ Backend will run in fallback IN-MEMORY storage mode. All stats and users will persist until server restart.');
    return false;
  }
};
