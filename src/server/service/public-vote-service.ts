'use server';

import { db } from '@/db';
import { post, vote } from '@/db/schema';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import { getVoteCount } from '@/server/repo/vote-repo';
import { and, eq } from 'drizzle-orm';
import { getOrSetVisitorId } from './public-visitor';

async function ensurePost(orgSlug: string, postId: string) {
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) throw new Error('Organization not found');
  const row = await db.query.post.findFirst({
    where: and(eq(post.id, postId), eq(post.organizationId, org.id)),
    columns: { id: true },
  });
  if (!row) throw new Error('Post not found');
  return org.id;
}

export async function publicAddVoteAction(input: {
  orgSlug: string;
  postId: string;
}) {
  const orgId = await ensurePost(input.orgSlug, input.postId);
  const anon = await getOrSetVisitorId();

  await db
    .insert(vote)
    .values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      postId: input.postId,
      userId: null,
      anonymousId: anon,
    })
    .onConflictDoNothing({ target: [vote.postId, vote.anonymousId] });

  return { count: await getVoteCount(input.postId) };
}

export async function publicRemoveVoteAction(input: {
  orgSlug: string;
  postId: string;
}) {
  await ensurePost(input.orgSlug, input.postId);
  const anon = await getOrSetVisitorId();

  await db
    .delete(vote)
    .where(and(eq(vote.postId, input.postId), eq(vote.anonymousId, anon)));

  return { count: await getVoteCount(input.postId) };
}
