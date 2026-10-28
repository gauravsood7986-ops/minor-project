import { z } from 'zod';

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    college: z.string().max(150).trim().optional(),
    bio: z.string().max(1000).trim().optional(),
    skills: z.array(z.string().trim()).optional(),
    languages: z.array(z.string().trim()).optional(),
    avatar: z
      .object({
        url: z.string().url().or(z.literal('')),
        public_id: z.string().optional().default(''),
      })
      .optional(),
    portfolioLinks: z
      .array(
        z.object({
          title: z.string().trim(),
          url: z.string().url('Portfolio link must be a valid URL'),
        })
      )
      .optional(),
    socialLinks: z
      .object({
        github: z.string().optional(),
        linkedin: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
  }),
};
