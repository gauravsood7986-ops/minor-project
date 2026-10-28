import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../models/Service.js';

export const createServiceSchema = {
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(5, 'Title must be at least 5 characters')
      .max(120, 'Title cannot exceed 120 characters')
      .trim(),
    description: z
      .string({ required_error: 'Description is required' })
      .min(20, 'Description must be at least 20 characters')
      .max(5000, 'Description cannot exceed 5000 characters')
      .trim(),
    category: z.enum(SERVICE_CATEGORIES, {
      required_error: 'Category is required',
      invalid_type_error: 'Please choose a valid category',
    }),
    price: z.coerce
      .number({ required_error: 'Price is required' })
      .min(0, 'Price cannot be negative')
      .max(5000000, 'Price cannot exceed 5,000,000'),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('INR'),
    deliveryTime: z.coerce
      .number({ required_error: 'Delivery time is required' })
      .int('Delivery time must be in whole days')
      .min(1, 'Delivery time must be at least 1 day')
      .max(90, 'Delivery time cannot exceed 90 days'),
    tags: z.array(z.string().trim()).default([]),
    portfolioAssets: z
      .array(
        z.object({
          url: z.string().url('Portfolio asset must be a valid URL'),
          public_id: z.string().optional().default(''),
          fileType: z.string().optional().default('image'),
          name: z.string().optional().default(''),
          size: z.number().optional().default(0),
        })
      )
      .default([]),
    portfolioUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
    revisionPolicy: z.string().max(500).optional().default('1 free revision included'),
    status: z.enum(['draft', 'published', 'paused', 'archived']).default('published'),
  }),
};

export const updateServiceSchema = {
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid Service ID format'),
  }),
  body: z.object({
    title: z.string().min(5).max(120).trim().optional(),
    description: z.string().min(20).max(5000).trim().optional(),
    category: z.enum(SERVICE_CATEGORIES).optional(),
    price: z.coerce.number().min(0).max(5000000).optional(),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']).optional(),
    deliveryTime: z.coerce.number().int().min(1).max(90).optional(),
    tags: z.array(z.string().trim()).optional(),
    portfolioAssets: z
      .array(
        z.object({
          url: z.string().url(),
          public_id: z.string().optional().default(''),
          fileType: z.string().optional().default('image'),
          name: z.string().optional().default(''),
          size: z.number().optional().default(0),
        })
      )
      .optional(),
    portfolioUrl: z.string().url().or(z.literal('')).optional(),
    revisionPolicy: z.string().max(500).optional(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
  }),
};

export const updateServiceStatusSchema = {
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid Service ID format'),
  }),
  body: z.object({
    status: z.enum(['draft', 'published', 'paused', 'archived'], {
      required_error: 'Status is required',
    }),
  }),
};

export const serviceQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
};
