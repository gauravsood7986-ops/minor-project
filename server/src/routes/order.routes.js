import { Router } from 'express';
import {
  createOrder,
  getMyPurchases,
  getMySales,
  getOrderById,
} from '../controllers/order.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../validators/order.validator.js';

const router = Router();

// All order endpoints require authentication
router.use(authenticate);

// Buy service / Place order
router.post('/', validate(createOrderSchema), createOrder);

// User's purchases (Items bought)
router.get('/my-purchases', getMyPurchases);

// User's sales (Items sold)
router.get('/my-sales', getMySales);

// Order by ID
router.get('/:id', getOrderById);

export default router;
