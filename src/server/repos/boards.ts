import { boards, posts, projects } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects';
import { and, desc, eq, sql } from 'drizzle-orm';

export async function listBoardsWithStats() {
  const { db } = getDatabase();
  const project = await getCurrentProjectFromHeaders();
  if (!project) return [];
  const where = eq(boards.projectId, project.id);
  let query = db
    .select({
      id: boards.id,
      name: boards.name,
      slug: boards.slug,
      description: boards.description,
      icon: boards.icon,
      position: boards.position,
      posts:
        sql<number>`count(*) FILTER (WHERE ${posts.isArchived} = false)`.as(
          'posts'
        ),
      open: sql<number>`count(*) FILTER (WHERE ${posts.status} IN ('backlog','planned','in_progress') AND ${posts.isArchived} = false)`.as(
        'open'
      ),
      inProgress:
        sql<number>`count(*) FILTER (WHERE ${posts.status} = 'in_progress' AND ${posts.isArchived} = false)`.as(
          'inProgress'
        ),
      planned:
        sql<number>`count(*) FILTER (WHERE ${posts.status} = 'planned' AND ${posts.isArchived} = false)`.as(
          'planned'
        ),
      completed:
        sql<number>`count(*) FILTER (WHERE ${posts.status} = 'completed' AND ${posts.isArchived} = false)`.as(
          'completed'
        ),
    })
    .from(boards)
    .leftJoin(posts, eq(posts.boardId, boards.id))
    .groupBy(boards.id)
    .orderBy(desc(boards.position));

  // @ts-expect-error drizzle chaining acceptable
  query = query.where(where);

  const result = await query;

  return result;
}

export async function getBoardBySlug(slugValue: string) {
  const { db } = getDatabase();
  const project = await getCurrentProjectFromHeaders();
  if (!project) return null;
  const [row] = await db
    .select({
      id: boards.id,
      name: boards.name,
      slug: boards.slug,
      description: boards.description,
      icon: boards.icon,
      position: boards.position,
      projectId: boards.projectId,
    })
    .from(boards)
    .leftJoin(projects, eq(boards.projectId, projects.id))
    .where(and(eq(boards.slug, slugValue), eq(boards.projectId, project.id)))
    .limit(1);
  return row ?? null;
}
