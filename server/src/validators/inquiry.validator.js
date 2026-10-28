import { z } from 'zod';

export const createInquirySchema = {
  body: z.object({
    serviceId: z
      .string({ required_error: 'Service ID is required' })
      .regex(/^[a-f\d]{24}$/i, 'Invalid Service ID format'),
    message: z
      .string({ required_error: 'Message is required' })
      .min(5, 'Message must be at least 5 characters')
      .max(2000, 'Message cannot exceed 2000 characters')
      .trim(),
  }),
};

export const updateInquiryStatusSchema = {
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid Inquiry ID format'),
  }),
  body: z.object({
    status: z.enum(['pending', 'read', 'replied', 'closed'], {
      required_error: 'Status is required',
    }),
  }),
};
