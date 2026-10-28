import mongoose from 'mongoose';
import { env } from './env.js';

// Disable buffering so unhandled operations immediately fail instead of hanging 10 seconds
mongoose.set('bufferCommands', false);

let isConnected = false;

export const connectDatabase = async () => {
  if (isConnected) return;

  try {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    };

    const conn = await mongoose.connect(env.MONGODB_URI, opts);
    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // If not in test environment, we re-throw to allow the server startup to report the failure
    if (env.NODE_ENV !== 'test') {
      throw error;
    }
  }
};

export const getDbStatus = () => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    connected: readyState === 1,
    state: states[readyState] || 'unknown',
  };
};

export const disconnectDatabase = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected cleanly.');
  }
};
