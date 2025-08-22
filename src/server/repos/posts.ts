import { and, desc, eq, sql } from 'drizzle-orm';
import { getDatabase } from '@/server/db';
import { boards, posts, projects } from '@/db/schema';

export async function listPosts({
  boardId,
  sort = 'trending',
  limit = 50,
  userId,
}: {
  boardId?: string;
  sort?: 'trending' | 'new' | 'top';
  limit?: number;
  userId?: string;
}) {
  const { db } = getDatabase();

  if (!userId) {
    return { items: [], total: 0, hasMore: false };
  }

  let orderBy;
  switch (sort) {
    case 'new':
      orderBy = desc(posts.createdAt);
      break;
    case 'top':
      orderBy = desc(posts.voteCount);
      break;
    case 'trending':
    default:
      orderBy = desc(posts.lastActivityAt);
      break;
  }

  const whereConditions = [eq(projects.userId, userId)];
  
  if (boardId) {
    whereConditions.push(eq(posts.boardId, boardId));
  }

  const items = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      voteCount: posts.voteCount,
      commentCount: posts.commentCount,
      createdAt: posts.createdAt,
      board: {
        id: boards.id,
        name: boards.name,
        slug: boards.slug,
      },
    })
    .from(posts)
    .innerJoin(boards, eq(posts.boardId, boards.id))
    .innerJoin(projects, eq(boards.projectId, projects.id))
    .where(and(...whereConditions))
    .orderBy(orderBy)
    .limit(limit + 1);

  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, limit) : items;

  return {
    items: result,
    total: result.length,
    hasMore,
  };
}

export async function createPost(data: {
  boardId: string;
  title: string;
  body?: string;
  slug: string;
}) {
  const { db } = getDatabase();
  
  // Get the project ID from the board
  const [board] = await db
    .select({ projectId: boards.projectId })
    .from(boards)
    .where(eq(boards.id, data.boardId));
  
  if (!board) {
    throw new Error('Board not found');
  }

  const [row] = await db
    .insert(posts)
    .values({
      boardId: data.boardId,
      projectId: board.projectId,
      title: data.title,
      body: data.body,
      slug: data.slug,
    })
    .returning();
  return row;
}

export async function getPostBySlug(boardId: string, postSlug: string) {
  const { db } = getDatabase();
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.boardId, boardId), eq(posts.slug, postSlug)))
    .limit(1);
  return row ?? null;
}

export async function incrementVoteCount(postId: string, delta: number) {
  const { db } = getDatabase();
  const [row] = await db
    .update(posts)
    .set({ voteCount: sql`${posts.voteCount} + ${delta}`, lastActivityAt: sql`now()` })
    .where(eq(posts.id, postId))
    .returning({ voteCount: posts.voteCount });
  return row?.voteCount ?? 0;
}

export async function incrementCommentCount(postId: string, delta: number) {
  const { db } = getDatabase();
  const [row] = await db
    .update(posts)
    .set({ commentCount: sql`${posts.commentCount} + ${delta}`, lastActivityAt: sql`now()` })
    .where(eq(posts.id, postId))
    .returning({ commentCount: posts.commentCount });
  return row?.commentCount ?? 0;
}

export async function bumpLastActivity(postId: string) {
  const { db } = getDatabase();
  await db.update(posts).set({ lastActivityAt: sql`now()` }).where(eq(posts.id, postId));
}

export async function archivePost(postId: string) {
  const { db } = getDatabase();
  await db.update(posts).set({ isArchived: true }).where(eq(posts.id, postId));
}

export async function pinPost(postId: string, pinnedValue: boolean) {
  const { db } = getDatabase();
  await db.update(posts).set({ pinned: pinnedValue }).where(eq(posts.id, postId));
}


