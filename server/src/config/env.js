import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/campusgig'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('campusgig_session'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  MAX_UPLOAD_MB: z.string().transform(Number).default('5'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  FROM_EMAIL: z.string().default('noreply@campusgig.local'),
});

let parsedEnv;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  console.error('Environment configuration validation failed:');
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error(error);
  }
  // In test environment, fallback gracefully if JWT_SECRET is unset
  if (process.env.NODE_ENV === 'test') {
    parsedEnv = envSchema.parse({
      ...process.env,
      JWT_SECRET: process.env.JWT_SECRET || 'test_jwt_secret_must_be_at_least_32_characters_long_super_safe',
    });
  } else {
    process.exit(1);
  }
}

export const env = parsedEnv;
