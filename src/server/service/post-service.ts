'use server';

import { db } from '@/db';
import { board, post, PostStatus } from '@/db/schema';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import { getPostById } from '@/server/repo/post-repo';
import { requireOrgAndRole } from '@/server/service/auth-service';
import { dashboardFeedbackPath } from '@/server/service/path-service';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createPostAction(input: {
  orgSlug: string;
  title: string;
  description: string;
  boardId: string;
}) {
  const schema = z.object({
    orgSlug: z.string().min(1),
    title: z.string().min(1).max(140),
    description: z.string().max(2000),
    boardId: z.string().min(1),
  });
  const parsed = schema.parse(input);
  const { org } = await requireOrgAndRole(parsed.orgSlug, 'member');

  const validBoard = await db.query.board.findFirst({
    where: and(eq(board.id, parsed.boardId), eq(board.organizationId, org.id)),
    columns: { id: true },
  });
  if (!validBoard) throw new Error('Invalid board');

  const [row] = await db
    .insert(post)
    .values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      boardId: parsed.boardId,
      title: parsed.title.trim(),
      description: parsed.description.trim(),
    })
    .returning();

  revalidatePath(await dashboardFeedbackPath(parsed.orgSlug));
  return row;
}

export async function updatePostAction(input: {
  orgSlug: string;
  id: string;
  title: string;
  description: string;
  status?: PostStatus | 'open';
  boardId: string;
}) {
  const schema = z.object({
    orgSlug: z.string().min(1),
    id: z.string().min(1),
    title: z.string().min(1).max(140),
    description: z.string().max(2000),
    status: z.union([z.literal('open'), z.custom<PostStatus>()]).optional(),
    boardId: z.string().min(1),
  });
  const parsed = schema.parse(input);
  const { org } = await requireOrgAndRole(parsed.orgSlug, 'member');

  const existing = await getPostById(parsed.id);
  if (!existing || existing.organizationId !== org.id)
    throw new Error('Post not found');

  const validBoard = await db.query.board.findFirst({
    where: and(eq(board.id, parsed.boardId), eq(board.organizationId, org.id)),
    columns: { id: true },
  });
  if (!validBoard) throw new Error('Invalid board');

  const [row] = await db
    .update(post)
    .set({
      title: parsed.title.trim(),
      description: parsed.description.trim(),
      status: parsed.status,
      boardId: parsed.boardId,
    })
    .where(eq(post.id, parsed.id))
    .returning();

  revalidatePath(await dashboardFeedbackPath(parsed.orgSlug));
  return row;
}

export async function deletePostAction(input: { orgSlug: string; id: string }) {
  const schema = z.object({
    orgSlug: z.string().min(1),
    id: z.string().min(1),
  });
  const parsed = schema.parse(input);
  await requireOrgAndRole(parsed.orgSlug, 'member');
  const existing = await getPostById(parsed.id);
  if (!existing) throw new Error('Post not found');

  const org = await getOrganizationBySlug(parsed.orgSlug);
  if (!org || existing.organizationId !== org.id)
    throw new Error('Post not found');

  await db.delete(post).where(eq(post.id, parsed.id));
  revalidatePath(await dashboardFeedbackPath(parsed.orgSlug));
}
