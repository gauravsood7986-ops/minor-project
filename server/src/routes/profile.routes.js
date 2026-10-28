import { Router } from 'express';
import {
  getProfileByUsername,
  updateMyProfile,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/profile.validator.js';

const router = Router();

router.get('/:username', getProfileByUsername);
router.patch('/me', authenticate, validate(updateProfileSchema), updateMyProfile);

export default router;
