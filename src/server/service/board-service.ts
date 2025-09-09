'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { db } from '@/db';
import { board } from '@/db/schema';
import { auth } from '@/server/auth';
import { getBoardById } from '@/server/repo/board-repo';

type Role = 'owner' | 'admin' | 'member';

function hasMinRole(role: Role | undefined, min: Role) {
  const rank: Record<Role, number> = { member: 1, admin: 2, owner: 3 };
  return !!role && rank[role] >= rank[min];
}

async function requireOrgAndRole(orgSlug: string, min: Role) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error('Not authenticated');

  const fullOrg = await auth.api.getFullOrganization({
    query: { organizationSlug: orgSlug },
    headers: h,
  });
  if (!fullOrg) throw new Error('Organization not found');

  const me = fullOrg.members.find((m) => m.userId === session.user.id);
  const role = me?.role as Role | undefined;
  if (!hasMinRole(role, min)) throw new Error('Insufficient permissions');

  return { h, org: fullOrg };
}

function feedbackPath(orgSlug: string) {
  return `/dashboard/${orgSlug}/feedback`;
}

export async function createBoardAction(input: {
  orgSlug: string;
  title: string;
  icon: string;
}) {
  const { org } = await requireOrgAndRole(input.orgSlug, 'member');
  const [row] = await db
    .insert(board)
    .values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      title: input.title.trim(),
      icon: input.icon.trim() || '💡',
    })
    .returning();

  revalidatePath(feedbackPath(input.orgSlug));
  return row;
}

export async function updateBoardAction(input: {
  orgSlug: string;
  id: string;
  title: string;
  icon: string;
}) {
  const { org } = await requireOrgAndRole(input.orgSlug, 'member');
  const existing = await getBoardById(input.id);
  if (!existing || existing.organizationId !== org.id)
    throw new Error('Board not found');

  const [row] = await db
    .update(board)
    .set({ title: input.title.trim(), icon: input.icon.trim() || '💡' })
    .where(eq(board.id, input.id))
    .returning();

  revalidatePath(feedbackPath(input.orgSlug));
  return row;
}

export async function deleteBoardAction(input: {
  orgSlug: string;
  id: string;
}) {
  const { org } = await requireOrgAndRole(input.orgSlug, 'admin');
  const existing = await getBoardById(input.id);
  if (!existing || existing.organizationId !== org.id)
    throw new Error('Board not found');

  await db.delete(board).where(eq(board.id, input.id));
  revalidatePath(feedbackPath(input.orgSlug));
}
