import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

let server;

const startServer = async () => {
  try {
    console.log(`[CampusGig] Initializing server in ${env.NODE_ENV} mode...`);

    // Attempt MongoDB connection
    // Connect to database on port 27017 or Atlas URI
    try {
      await connectDatabase();
    } catch (dbErr) {
      console.error('[CampusGig Error] Could not connect to MongoDB:', dbErr.message);
      console.warn('[CampusGig Warning] Server will start in degraded state to serve health checks.');
      console.warn('-> Ensure your MongoDB instance is running or update MONGODB_URI in server/.env');
    }

    server = app.listen(env.PORT, () => {
      console.log(`[CampusGig] Server running on http://localhost:${env.PORT}`);
      console.log(`[CampusGig] Health Check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('[CampusGig Fatal] Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n[CampusGig] Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('[CampusGig] HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CampusGig Unhandled Rejection]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[CampusGig Uncaught Exception]', error);
  process.exit(1);
});

startServer();
