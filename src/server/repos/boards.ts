import { boards, projects } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { and, eq } from 'drizzle-orm';

export async function listBoardsWithStats(userId?: string) {
  const { db } = getDatabase();

  if (!userId) {
    return [];
  }

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
    .where(eq(projects.userId, userId))
    .orderBy(boards.position, boards.createdAt);

  // Add post count as 0 for now (we can optimize this later)
  return boardsData.map(board => ({
    ...board,
    postCount: 0
  }));
}

export async function getBoardBySlug(slug: string, userId?: string) {
  const { db } = getDatabase();

  if (!userId) {
    return null;
  }

  const [row] = await db
    .select()
    .from(boards)
    .innerJoin(projects, eq(boards.projectId, projects.id))
    .where(and(eq(boards.slug, slug), eq(projects.userId, userId)));
  
  return row ? row.boards : null;
}
