import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const setAuthCookie = (res, token) => {
  const isProduction = env.NODE_ENV === 'production';
  // 7 days in milliseconds
  const maxAge = 7 * 24 * 60 * 60 * 1000;

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge,
    path: '/',
  });
};

export const clearAuthCookie = (res) => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie(env.COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
};
