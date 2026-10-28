import { Router } from 'express';
import {
  createInquiry,
  getSentInquiries,
  getReceivedInquiries,
  getInquiryById,
  updateInquiryStatus,
} from '../controllers/inquiry.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createInquirySchema,
  updateInquiryStatusSchema,
} from '../validators/inquiry.validator.js';
import { inquiryLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', authenticate, inquiryLimiter, validate(createInquirySchema), createInquiry);
router.get('/sent', authenticate, getSentInquiries);
router.get('/received', authenticate, getReceivedInquiries);
router.get('/:id', authenticate, getInquiryById);
router.patch('/:id/status', authenticate, validate(updateInquiryStatusSchema), updateInquiryStatus);

export default router;
