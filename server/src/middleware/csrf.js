import crypto from 'crypto';
import { env } from '../config/env.js';

export const CSRF_COOKIE_NAME = 'campusgig_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const setCsrfCookie = (res, token) => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client JS to include in headers
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const csrfProtection = (req, res, next) => {
  // Safe HTTP methods do not change state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Bypass CSRF checks in test environment for API integration tests
  if (env.NODE_ENV === 'test') {
    return next();
  }

  // If request is authenticated via Bearer token in header instead of cookies, CSRF is not needed
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  // If both cookie and header are provided, verify they match
  if (cookieToken && headerToken && cookieToken === headerToken) {
    return next();
  }

  // Also verify Origin / Referer against CLIENT_ORIGIN if present
  const origin = req.headers.origin || req.headers.referer;
  if (origin && !origin.startsWith(env.CLIENT_ORIGIN) && !origin.startsWith('http://localhost')) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed: Invalid request origin.',
    });
  }

  // If client provides matching CSRF token or origin is localhost development
  if (cookieToken && headerToken && cookieToken === headerToken) {
    return next();
  }

  // Allow first-time login/register if CSRF token was just acquired
  if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    return next();
  }

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing or mismatch. Please refresh your session.',
    });
  }

  next();
};
