import { boards, posts, projects } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { and, count, eq, ilike } from 'drizzle-orm';

export async function listBoardsWithStats(projectId: string) {
  const { db } = getDatabase();

  if (!projectId) {
    return [];
  }

  const whereCondition = eq(boards.projectId, projectId);

  // Get boards for the project
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
    .where(whereCondition)
    .orderBy(boards.position, boards.createdAt);

  // Get post counts for each board
  const boardsWithPostCounts = await Promise.all(
    boardsData.map(async (board) => {
      const postCountResult = await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.boardId, board.id));

      return {
        ...board,
        postCount: postCountResult[0]?.count || 0,
      };
    })
  );

  return boardsWithPostCounts;
}

export async function listBoardsForProject(projectId: string) {
  const { db } = getDatabase();

  if (!projectId) {
    return [];
  }

  // Get boards for the project (public access)
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
    .where(eq(boards.projectId, projectId))
    .orderBy(boards.position, boards.createdAt);

  // Get post counts for each board
  const boardsWithPostCounts = await Promise.all(
    boardsData.map(async (board) => {
      const postCountResult = await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.boardId, board.id));

      return {
        ...board,
        postCount: postCountResult[0]?.count || 0,
      };
    })
  );

  return boardsWithPostCounts;
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
