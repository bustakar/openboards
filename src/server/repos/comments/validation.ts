import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().min(1).max(10_000),
  authorName: z.string().max(60).optional(),
  _hpt: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
