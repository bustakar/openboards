import { z } from 'zod';

export const createPostSchema = z.object({
  boardId: z.string().uuid(),
  title: z.string().min(3).max(120),
  body: z.string().max(10_000).optional().or(z.literal('')),
  _hpt: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export function sanitizeTitle(input: string) {
  return input.replace(/<[^>]*>/g, '').trim();
}

export function sanitizeBody(input: string) {
  // Remove script and style tags completely
  const sanitized = input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags and content
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove on* event handlers with leading whitespace

  return sanitized.trim();
}
