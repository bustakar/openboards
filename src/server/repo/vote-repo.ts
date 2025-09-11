import { db } from '@/db';
import { vote } from '@/db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';

export async function getVoteCount(postId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(vote)
    .where(eq(vote.postId, postId));
  return Number(row?.count ?? 0);
}

export async function getVotedPostIdsByUser(
  orgId: string,
  userId: string,
  postIds: string[]
) {
  if (!postIds.length) return new Set<string>();
  const rows = await db
    .select({ postId: vote.postId })
    .from(vote)
    .where(
      and(
        eq(vote.organizationId, orgId),
        eq(vote.userId, userId),
        inArray(vote.postId, postIds)
      )
    );
  return new Set(rows.map((r) => r.postId));
}
