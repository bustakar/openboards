'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { post, vote } from '@/db/schema';
import { getVoteCount } from '@/server/repo/vote-repo';
import { requireOrgAndRole } from '@/server/service/auth-service';

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
  const { org, session } = await requireOrgAndRole(input.orgSlug, 'member');
  await ensurePostInOrg(org.id, input.postId);

  await db
    .insert(vote)
    .values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      postId: input.postId,
      userId: session.user.id,
    })
    .onConflictDoNothing({ target: [vote.postId, vote.userId] });

  return { count: await getVoteCount(input.postId) };
}

export async function removeVoteAction(input: {
  orgSlug: string;
  postId: string;
}) {
  const { org, session } = await requireOrgAndRole(input.orgSlug, 'member');
  await ensurePostInOrg(org.id, input.postId);

  await db
    .delete(vote)
    .where(and(eq(vote.postId, input.postId), eq(vote.userId, session.user.id)));

  return { count: await getVoteCount(input.postId) };
}

export async function getVoteCountAction(input: { postId: string }) {
  return { count: await getVoteCount(input.postId) };
}
