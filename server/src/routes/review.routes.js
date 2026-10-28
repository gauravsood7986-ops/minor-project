import { Router } from 'express';
import {
  createReview,
  getReviewsByUsername,
} from '../controllers/review.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema } from '../validators/review.validator.js';

const router = Router();

router.post('/', authenticate, validate(createReviewSchema), createReview);
router.get('/:username', getReviewsByUsername);

export default router;
