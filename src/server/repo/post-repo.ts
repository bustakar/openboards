import { db } from '@/db';
import { board, post } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { getOrganizationBySlug } from './org-repo';

export async function getPostById(id: string) {
  return db.query.post.findFirst({ where: eq(post.id, id) });
}

export async function getPostsWithVotesByOrgId(
  orgId: string,
  userId?: string | null
) {
  return db
    .select({
      id: post.id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      boardId: post.boardId,
      boardTitle: board.title,
      boardIcon: board.icon,
      votesCount: sql<number>`(select count(*)::int from "vote" v where v."post_id" = ${post.id})`,
      hasVoted:
        userId && userId.length > 0
          ? sql<boolean>`exists (select 1 from "vote" v where v."post_id" = ${post.id} and v."user_id" = ${userId})`
          : sql<boolean>`false`,
    })
    .from(post)
    .leftJoin(board, eq(post.boardId, board.id))
    .where(eq(post.organizationId, orgId))
    .orderBy(post.createdAt);
}

export async function getPostsWithVotesByBoardId(
  orgId: string,
  boardId: string,
  userId?: string | null
) {
  return db
    .select({
      id: post.id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      boardId: post.boardId,
      boardTitle: board.title,
      boardIcon: board.icon,
      votesCount: sql<number>`(select count(*)::int from "vote" v where v."post_id" = ${post.id})`,
      hasVoted:
        userId && userId.length > 0
          ? sql<boolean>`exists (select 1 from "vote" v where v."post_id" = ${post.id} and v."user_id" = ${userId})`
          : sql<boolean>`false`,
    })
    .from(post)
    .leftJoin(board, eq(post.boardId, board.id))
    .where(and(eq(post.organizationId, orgId), eq(post.boardId, boardId)))
    .orderBy(post.createdAt);
}

export async function getPostsByOrgSlug(slug: string) {
  const org = await getOrganizationBySlug(slug);
  if (!org) throw new Error('Organization not found');
  return getPostsWithVotesByOrgId(org.id, null);
}
