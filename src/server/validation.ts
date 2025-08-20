import { z } from "zod";

export const createPostSchema = z.object({
  boardId: z.string().uuid(),
  title: z.string().min(3).max(120),
  body: z.string().max(10_000).optional().or(z.literal("")),
  _hpt: z.string().optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(10_000),
  authorName: z.string().max(60).optional(),
  _hpt: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export function sanitizeTitle(input: string) {
  return input.replace(/<[^>]*>/g, "").trim();
}

export function sanitizeBody(input: string) {
  // Minimal sanitizer: strip script/style and on* attrs; keep plain text
  return input.replace(/<\/(script|style)>|<(script|style)[^>]*>|on\w+\s*=\s*\"[^\"]*\"/gi, "").trim();
}


