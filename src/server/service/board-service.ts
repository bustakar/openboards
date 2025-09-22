'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { board } from '@/db/schema';
import { getBoardById } from '@/server/repo/board-repo';
import { requireOrgAndRole } from '@/server/service/auth-service';
import { dashboardFeedbackPath } from '@/server/service/path-service';
import { z } from 'zod';

export async function createBoardAction(input: {
  orgSlug: string;
  title: string;
  icon: string;
}) {
  const schema = z.object({
    orgSlug: z.string().min(1),
    title: z.string().min(1).max(120),
    icon: z.string().min(1).max(16),
  });
  const parsed = schema.parse(input);
  const { org } = await requireOrgAndRole(input.orgSlug, 'member');
  const [row] = await db
    .insert(board)
    .values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      title: parsed.title.trim(),
      icon: parsed.icon.trim() || '💡',
    })
    .returning();

  revalidatePath(await dashboardFeedbackPath(input.orgSlug));
  return row;
}

export async function updateBoardAction(input: {
  orgSlug: string;
  id: string;
  title: string;
  icon: string;
}) {
  const schema = z.object({
    orgSlug: z.string().min(1),
    id: z.string().min(1),
    title: z.string().min(1).max(120),
    icon: z.string().min(1).max(16),
  });
  const parsed = schema.parse(input);
  const { org } = await requireOrgAndRole(input.orgSlug, 'member');
  const existing = await getBoardById(parsed.id);
  if (!existing || existing.organizationId !== org.id)
    throw new Error('Board not found');

  const [row] = await db
    .update(board)
    .set({ title: parsed.title.trim(), icon: parsed.icon.trim() || '💡' })
    .where(eq(board.id, parsed.id))
    .returning();

  revalidatePath(await dashboardFeedbackPath(input.orgSlug));
  return row;
}

export async function deleteBoardAction(input: {
  orgSlug: string;
  id: string;
}) {
  const schema = z.object({
    orgSlug: z.string().min(1),
    id: z.string().min(1),
  });
  const parsed = schema.parse(input);
  const { org } = await requireOrgAndRole(parsed.orgSlug, 'admin');
  const existing = await getBoardById(parsed.id);
  if (!existing || existing.organizationId !== org.id)
    throw new Error('Board not found');

  await db.delete(board).where(eq(board.id, parsed.id));
  revalidatePath(await dashboardFeedbackPath(parsed.orgSlug));
}
