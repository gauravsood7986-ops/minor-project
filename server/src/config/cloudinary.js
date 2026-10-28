import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Cloudinary] Configured successfully for file uploads.');
} else {
  console.log('[Cloudinary] Not configured. Local file storage / data URL fallback active.');
}

export { cloudinary, isCloudinaryConfigured };
