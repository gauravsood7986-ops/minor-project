import { Router } from 'express';
import {
  uploadMiddleware,
  uploadFile,
  deleteUpload,
} from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', authenticate, uploadLimiter, uploadMiddleware, uploadFile);
router.delete('/:id', authenticate, deleteUpload);

export default router;
