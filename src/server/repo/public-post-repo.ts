import { db } from '@/db';
import { board, post, type PostStatus } from '@/db/schema';
import { and, asc, desc, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm';
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

export type PostsListSort = 'new' | 'top' | 'hot' | 'old';
export type PostsListOptions = {
  statuses?: PostStatus[];
  boardId?: string;
  search?: string;
  sort?: PostsListSort;
};

export async function getPublicPostsByOrgSlug(
  orgSlug: string,
  options: PostsListOptions = {},
  visitorId?: string | null
) {
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) throw new Error('Organization not found');

  const { statuses, boardId, search, sort = 'new' } = options;

  const conditions: SQL[] = [eq(post.organizationId, org.id)];
  if (boardId) conditions.push(eq(post.boardId, boardId));
  if (statuses?.length) conditions.push(inArray(post.status, statuses));
  if (search && search.trim()) {
    const like = `%${search.trim()}%`;
    conditions.push(
      or(ilike(post.title, like)!, ilike(post.description, like)!)!
    );
  }

  const hasVotedExpr = visitorId
    ? sql<boolean>`exists (select 1 from "vote" v where v."post_id" = ${post.id} and v."anonymous_id" = ${visitorId})`
    : sql<boolean>`false`;

  const votesExpr = sql<number>`(select count(*)::int from "vote" v where v."post_id" = ${post.id})`;
  const hoursSinceExpr = sql<number>`greatest(1, extract(epoch from (now() - ${post.createdAt})) / 3600.0)`;
  const hotScoreExpr = sql<number>`${votesExpr} / power(${hoursSinceExpr} + 2, 1.5)`;

  const order =
    sort === 'old'
      ? [asc(post.createdAt)]
      : sort === 'top'
        ? [desc(votesExpr), desc(post.createdAt)]
        : sort === 'hot'
          ? [desc(hotScoreExpr), desc(post.createdAt)]
          : [desc(post.createdAt)];

  return db
    .select(baseSelect(hasVotedExpr))
    .from(post)
    .leftJoin(board, eq(post.boardId, board.id))
    .where(and(...conditions))
    .orderBy(...order);
}
