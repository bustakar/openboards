import { db } from '@/db';
import type { PostStatus } from '@/db/schema';
import { board, post } from '@/db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { getOrganizationBySlug } from './org-repo';

export async function getPostById(id: string) {
  return db.query.post.findFirst({ where: eq(post.id, id) });
}

function baseSelect(userId?: string | null) {
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
    hasVoted:
      userId && userId.length > 0
        ? sql<boolean>`exists (select 1 from "vote" v where v."post_id" = ${post.id} and v."user_id" = ${userId})`
        : sql<boolean>`false`,
  };
}

export async function getPostsWithVotesByOrgId(
  orgId: string,
  userId?: string | null,
  statuses?: PostStatus[]
) {
  const conditions = [eq(post.organizationId, orgId)];
  if (statuses && statuses.length)
    conditions.push(inArray(post.status, statuses));

  return db
    .select(baseSelect(userId))
    .from(post)
    .leftJoin(board, eq(post.boardId, board.id))
    .where(and(...conditions))
    .orderBy(post.createdAt);
}

export async function getPostsWithVotesByBoardId(
  orgId: string,
  boardIdVal: string,
  userId?: string | null,
  statuses?: PostStatus[]
) {
  const conditions = [
    eq(post.organizationId, orgId),
    eq(post.boardId, boardIdVal),
  ];
  if (statuses && statuses.length)
    conditions.push(inArray(post.status, statuses));

  return db
    .select(baseSelect(userId))
    .from(post)
    .leftJoin(board, eq(post.boardId, board.id))
    .where(and(...conditions))
    .orderBy(post.createdAt);
}

export async function getPostsByOrgSlug(slug: string) {
  const org = await getOrganizationBySlug(slug);
  if (!org) return [];
  return getPostsWithVotesByOrgId(org.id, null);
}
