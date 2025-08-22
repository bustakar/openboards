import { boards, projects } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { and, eq, ilike } from 'drizzle-orm';

export async function listBoardsWithStats(userId?: string, projectId?: string | null) {
  const { db } = getDatabase();

  if (!userId || !projectId) {
    return [];
  }

  const whereCondition = and(eq(projects.userId, userId), eq(projects.id, projectId));

  // Get boards directly for the user
  const boardsData = await db
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
    })
    .from(boards)
    .innerJoin(projects, eq(boards.projectId, projects.id))
    .where(whereCondition)
    .orderBy(boards.position, boards.createdAt);

  // Add post count as 0 for now (we can optimize this later)
  return boardsData.map(board => ({
    ...board,
    postCount: 0
  }));
}

export async function getBoardBySlug(slug: string, userId?: string) {
  const { db } = getDatabase();

  if (userId) {
    // Private access - filter by user authorization
    const [row] = await db
      .select()
      .from(boards)
      .innerJoin(projects, eq(boards.projectId, projects.id))
      .where(and(ilike(boards.slug, slug), eq(projects.userId, userId)));
    
    return row ? row.boards : null;
  } else {
    // Public access - no user authorization required
    const [row] = await db
      .select()
      .from(boards)
      .where(ilike(boards.slug, slug))
      .limit(1);
    
    return row ?? null;
  }
}
