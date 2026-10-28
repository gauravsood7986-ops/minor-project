import multer from 'multer';
import crypto from 'crypto';
import { Upload } from '../models/Upload.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file format '${file.mimetype}'. Allowed: JPEG, PNG, WebP, GIF, PDF`
        )
      );
    }
  },
}).single('file');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided for upload',
      });
    }

    const file = req.file;
    const originalName = file.originalname || 'upload';
    const extension = originalName.split('.').pop() || 'bin';
    const uniqueId = crypto.randomUUID();
    const sanitizedFileName = `${uniqueId}.${extension}`;
    const isImage = file.mimetype.startsWith('image/');
    const fileType = isImage ? 'image' : (file.mimetype === 'application/pdf' ? 'pdf' : 'file');

    let fileUrl = '';
    let publicId = '';
    let provider = 'cloudinary';

    if (isCloudinaryConfigured) {
      // Upload stream to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'campusgig/portfolios',
            resource_type: isImage ? 'image' : 'raw',
            public_id: `${uniqueId}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      fileUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      // Local file storage in server/public/uploads/
      provider = 'local';
      const filePath = path.join(uploadsDir, sanitizedFileName);
      fs.writeFileSync(filePath, file.buffer);
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol || 'http';
      fileUrl = `${protocol}://${host}/uploads/${sanitizedFileName}`;
      publicId = sanitizedFileName;
    }

    // Persist file metadata in MongoDB
    const uploadDoc = new Upload({
      uploader: req.user._id,
      originalName,
      fileName: sanitizedFileName,
      mimeType: file.mimetype,
      size: file.size,
      url: fileUrl,
      publicId,
      provider,
    });

    await uploadDoc.save();

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        upload: {
          id: uploadDoc._id,
          url: fileUrl,
          name: originalName,
          size: file.size,
          mimeType: file.mimetype,
          fileType,
          public_id: publicId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUpload = async (req, res, next) => {
  try {
    const { id } = req.params;

    const uploadDoc = await Upload.findById(id);
    if (!uploadDoc) {
      return res.status(404).json({
        success: false,
        message: 'Upload record not found',
      });
    }

    const isOwner = uploadDoc.uploader.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this file.',
      });
    }

    if (uploadDoc.provider === 'cloudinary' && isCloudinaryConfigured && uploadDoc.publicId) {
      try {
        await cloudinary.uploader.destroy(uploadDoc.publicId);
      } catch (err) {
        console.error('Failed to destroy Cloudinary resource:', err.message);
      }
    }

    await Upload.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'File removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
