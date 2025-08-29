import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message:
        'Subdomain must contain only lowercase letters, numbers, and hyphens',
    }),
  description: z.string().max(500).optional(),
  userId: z.string(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subdomain: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message:
        'Subdomain must contain only lowercase letters, numbers, and hyphens',
    })
    .optional(),
  description: z.string().max(500).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
