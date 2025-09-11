'use server';

import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';

import { db } from '@/db';
import { post, vote } from '@/db/schema';
import { auth } from '@/server/auth';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import { getVoteCount } from '@/server/repo/vote-repo';

async function requireViewer(orgSlug: string) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error('Not authenticated');

  const org = await getOrganizationBySlug(orgSlug);
  if (!org) throw new Error('Organization not found');

  return { org, userId: session.user.id };
}

async function ensurePostInOrg(orgId: string, postId: string) {
  const row = await db.query.post.findFirst({
    where: and(eq(post.id, postId), eq(post.organizationId, orgId)),
    columns: { id: true },
  });
  if (!row) throw new Error('Post not found');
}

export async function addVoteAction(input: {
  orgSlug: string;
  postId: string;
}) {
  const { org, userId } = await requireViewer(input.orgSlug);
  await ensurePostInOrg(org.id, input.postId);

  await db
    .insert(vote)
    .values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      postId: input.postId,
      userId,
    })
    .onConflictDoNothing({ target: [vote.postId, vote.userId] });

  return { count: await getVoteCount(input.postId) };
}

export async function removeVoteAction(input: {
  orgSlug: string;
  postId: string;
}) {
  const { org, userId } = await requireViewer(input.orgSlug);
  await ensurePostInOrg(org.id, input.postId);

  await db
    .delete(vote)
    .where(and(eq(vote.postId, input.postId), eq(vote.userId, userId)));

  return { count: await getVoteCount(input.postId) };
}

export async function getVoteCountAction(input: { postId: string }) {
  return { count: await getVoteCount(input.postId) };
}
