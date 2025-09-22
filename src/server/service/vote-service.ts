'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { post, vote } from '@/db/schema';
import { getVoteCount } from '@/server/repo/vote-repo';
import { requireOrgAndRole } from '@/server/service/auth-service';
import { z } from 'zod';

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
  const schema = z.object({
    orgSlug: z.string().min(1),
    postId: z.string().min(1),
  });
  const parsed = schema.parse(input);
  const { org, session } = await requireOrgAndRole(parsed.orgSlug, 'member');
  await ensurePostInOrg(org.id, parsed.postId);

  await db
    .insert(vote)
    .values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      postId: parsed.postId,
      userId: session.user.id,
    })
    .onConflictDoNothing({ target: [vote.postId, vote.userId] });

  return { count: await getVoteCount(parsed.postId) };
}

export async function removeVoteAction(input: {
  orgSlug: string;
  postId: string;
}) {
  const schema = z.object({
    orgSlug: z.string().min(1),
    postId: z.string().min(1),
  });
  const parsed = schema.parse(input);
  const { org, session } = await requireOrgAndRole(parsed.orgSlug, 'member');
  await ensurePostInOrg(org.id, parsed.postId);

  await db
    .delete(vote)
    .where(
      and(eq(vote.postId, parsed.postId), eq(vote.userId, session.user.id))
    );

  return { count: await getVoteCount(parsed.postId) };
}

export async function getVoteCountAction(input: { postId: string }) {
  return { count: await getVoteCount(input.postId) };
}
