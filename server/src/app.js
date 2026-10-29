import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { getDbStatus } from './config/database.js';
import { csrfProtection } from './middleware/csrf.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/service.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import profileRoutes from './routes/profile.routes.js';
import reviewRoutes from './routes/review.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import orderRoutes from './routes/order.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve local static uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')));

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration with explicit origins and credentials

const allowedOrigins = [
  env.CLIENT_ORIGIN?.replace(/\/+$/, ''),
  'https://minor-project-frontend-six.vercel.app',
  'https://minor-project-frontend-git-main-garry-1380.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:');

      if (isAllowed) {
        return callback(null, true);
      }

      console.error(`CORS blocked for origin: ${origin}`);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
    ],
  })
);



// Standard request body and cookie parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Global Rate Limiting
app.use('/api', globalLimiter);

// CSRF Protection for state-changing requests
app.use('/api', csrfProtection);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  return res.status(200).json({
    status: dbStatus.connected ? 'ok' : 'degraded',
    service: 'campusgig-api',
    timestamp: new Date().toISOString(),
    database: dbStatus.state,
  });
});

// Database connectivity guard: stop accepting application requests if MongoDB is offline
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path === '/auth/csrf') {
    return next();
  }
  const dbStatus = getDbStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. MongoDB is not running or unreachable. Please start your local MongoDB service (port 27017) or configure MONGODB_URI in server/.env with your MongoDB Atlas connection string.',
    });
  }
  next();
});

// Mount application API modules
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/orders', orderRoutes);

// Catch 404 and forward to error handler
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

export default app;
