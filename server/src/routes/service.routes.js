import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  updateServiceStatus,
} from '../controllers/service.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createServiceSchema,
  updateServiceSchema,
  updateServiceStatusSchema,
  serviceQuerySchema,
} from '../validators/service.validator.js';

const router = Router();

router.get('/', validate(serviceQuerySchema), getServices);
router.get('/mine', authenticate, getMyServices);
router.get('/:id', optionalAuthenticate, getServiceById);
router.post('/', authenticate, validate(createServiceSchema), createService);
router.patch('/:id', authenticate, validate(updateServiceSchema), updateService);
router.delete('/:id', authenticate, deleteService);
router.patch('/:id/status', authenticate, validate(updateServiceStatusSchema), updateServiceStatus);

export default router;
