import { z } from 'zod';

export const createReviewSchema = {
  body: z.object({
    serviceId: z
      .string({ required_error: 'Service ID is required' })
      .regex(/^[a-f\d]{24}$/i, 'Invalid Service ID format'),
    rating: z.coerce
      .number({ required_error: 'Rating is required' })
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    comment: z
      .string({ required_error: 'Comment is required' })
      .min(5, 'Comment must be at least 5 characters')
      .max(1000, 'Comment cannot exceed 1000 characters')
      .trim(),
  }),
};
