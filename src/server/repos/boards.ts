import { and, eq, sql } from 'drizzle-orm';
import { getDatabase } from '@/server/db';
import { boards } from '@/db/schema';

export async function listBoardsWithStats(userId?: string) {
  const { db } = getDatabase();
  
  if (!userId) {
    return [];
  }

  // Get user's projects first
  const userProjects = await db
    .select({ id: sql<string>`projects.id` })
    .from(sql`projects`)
    .where(eq(sql`projects.user_id`, userId));

  if (userProjects.length === 0) {
    return [];
  }

  const projectIds = userProjects.map(p => p.id);

  return await db
    .select({
      id: boards.id,
      name: boards.name,
      slug: boards.slug,
      description: boards.description,
      icon: boards.icon,
      position: boards.position,
      projectId: boards.projectId,
      createdAt: boards.createdAt,
      updatedAt: boards.updatedAt,
      postCount: sql<number>`COALESCE(post_counts.count, 0)`,
    })
    .from(boards)
    .leftJoin(
      sql`(
        SELECT board_id, COUNT(*) as count 
        FROM posts 
        WHERE project_id = ANY(${projectIds})
        GROUP BY board_id
      ) as post_counts`,
      eq(boards.id, sql`post_counts.board_id`)
    )
    .where(sql`boards.project_id = ANY(${projectIds})`)
    .orderBy(boards.position, boards.createdAt);
}

export async function getBoardBySlug(slug: string, userId?: string) {
  const { db } = getDatabase();
  
  if (!userId) {
    return null;
  }

  // Get user's projects first
  const userProjects = await db
    .select({ id: sql<string>`projects.id` })
    .from(sql`projects`)
    .where(eq(sql`projects.user_id`, userId));

  if (userProjects.length === 0) {
    return null;
  }

  const projectIds = userProjects.map(p => p.id);

  const [row] = await db
    .select()
    .from(boards)
    .where(
      and(
        eq(boards.slug, slug),
        sql`boards.project_id = ANY(${projectIds})`
      )
    );
  return row;
}
