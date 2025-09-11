import { db } from '@/db';
import { board, post, type PostStatus } from '@/db/schema';
import { and, eq, inArray, SQL, sql } from 'drizzle-orm';
import { getOrganizationBySlug } from './org-repo';

function baseSelect(hasVotedExpr: SQL<boolean>) {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    status: post.status,
    createdAt: post.createdAt,
    boardId: post.boardId,
    boardTitle: board.title,
    boardIcon: board.icon,
    votesCount: sql<number>`(select count(*)::int from "vote" v where v."post_id" = ${post.id})`,
    hasVoted: hasVotedExpr,
  };
}

export async function getPublicPostsByOrgSlug(
  orgSlug: string,
  visitorId: string | null,
  statuses?: PostStatus[],
  boardId?: string
) {
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) throw new Error('Organization not found');

  const conditions: SQL[] = [eq(post.organizationId, org.id)];
  if (boardId) conditions.push(eq(post.boardId, boardId));
  if (statuses?.length) conditions.push(inArray(post.status, statuses));

  const hasVotedExpr = visitorId
    ? sql<boolean>`exists (select 1 from "vote" v where v."post_id" = ${post.id} and v."anonymous_id" = ${visitorId})`
    : sql<boolean>`false`;

  return db
    .select(baseSelect(hasVotedExpr))
    .from(post)
    .leftJoin(board, eq(post.boardId, board.id))
    .where(and(...conditions))
    .orderBy(post.createdAt);
}
