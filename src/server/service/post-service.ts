'use server';

import { db } from '@/db';
import { board, post, PostStatus } from '@/db/schema';
import { getPostById } from '@/server/repo/post-repo';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireOrgAndRole } from '@/server/service/auth-service';
import { dashboardFeedbackPath } from '@/server/service/path-service';
import { getOrganizationBySlug } from '@/server/repo/org-repo';

export async function createPostAction(input: {
  orgSlug: string;
  title: string;
  description: string;
  boardId: string;
}) {
  const { org } = await requireOrgAndRole(input.orgSlug, 'member');

  const validBoard = await db.query.board.findFirst({
    where: and(eq(board.id, input.boardId), eq(board.organizationId, org.id)),
    columns: { id: true },
  });
  if (!validBoard) throw new Error('Invalid board');

  const [row] = await db
    .insert(post)
    .values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      boardId: input.boardId,
      title: input.title.trim(),
      description: input.description.trim(),
    })
    .returning();

  revalidatePath(dashboardFeedbackPath(input.orgSlug));
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
  const { org } = await requireOrgAndRole(input.orgSlug, 'member');

  const existing = await getPostById(input.id);
  if (!existing || existing.organizationId !== org.id)
    throw new Error('Post not found');

  const validBoard = await db.query.board.findFirst({
    where: and(eq(board.id, input.boardId), eq(board.organizationId, org.id)),
    columns: { id: true },
  });
  if (!validBoard) throw new Error('Invalid board');

  const [row] = await db
    .update(post)
    .set({
      title: input.title.trim(),
      description: input.description.trim(),
      status: input.status,
      boardId: input.boardId,
    })
    .where(eq(post.id, input.id))
    .returning();

  revalidatePath(dashboardFeedbackPath(input.orgSlug));
  return row;
}

export async function deletePostAction(input: { orgSlug: string; id: string }) {
  await requireOrgAndRole(input.orgSlug, 'member');
  const existing = await getPostById(input.id);
  if (!existing) throw new Error('Post not found');

  const org = await getOrganizationBySlug(input.orgSlug);
  if (!org || existing.organizationId !== org.id)
    throw new Error('Post not found');

  await db.delete(post).where(eq(post.id, input.id));
  revalidatePath(dashboardFeedbackPath(input.orgSlug));
}
