// server/config/db.js
// MongoDB connection using Mongoose.
// Exported as a function so it can be called from server.js
// and easily mocked in tests.

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options ensure a stable connection pool
      maxPoolSize: 10,                // Max simultaneous connections
      serverSelectionTimeoutMS: 5000, // Timeout if no server found in 5s
      socketTimeoutMS: 45000,         // Close socket after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Log when MongoDB connection is lost
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected.');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure — Kubernetes will restart the pod
    process.exit(1);
  }
};