import { db } from '@/db';
import { board, post } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getOrganizationBySlug } from './org-repo';

export async function getPostById(id: string) {
  return db.query.post.findFirst({ where: eq(post.id, id) });
}

export async function getPostsByOrgId(orgId: string) {
  return db
    .select({
      id: post.id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      boardId: post.boardId,
      boardTitle: board.title,
      boardIcon: board.icon,
    })
    .from(post)
    .leftJoin(board, eq(post.boardId, board.id))
    .where(eq(post.organizationId, orgId))
    .orderBy(post.createdAt);
}

export async function getPostsByOrgSlug(slug: string) {
  const org = await getOrganizationBySlug(slug);
  if (!org) throw new Error('Organization not found');
  return getPostsByOrgId(org.id);
}

export async function getPostsByBoardId(orgId: string, boardId: string) {
  return db
    .select({
      id: post.id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      boardId: post.boardId,
      boardTitle: board.title,
      boardIcon: board.icon,
    })
    .from(post)
    .leftJoin(board, eq(post.boardId, board.id))
    .where(and(eq(post.organizationId, orgId), eq(post.boardId, boardId)))
    .orderBy(post.createdAt);
}
