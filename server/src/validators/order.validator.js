import { z } from 'zod';

export const createOrderSchema = {
  body: z.object({
    serviceId: z
      .string({ required_error: 'Service ID is required' })
      .regex(/^[a-f\d]{24}$/i, 'Invalid Service ID format'),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().default(''),
    paymentMethod: z.string().max(100).optional().default('CampusGig Student Pay (Instant)'),
  }),
};
