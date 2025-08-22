import { boards, posts, projects } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { and, desc, eq } from 'drizzle-orm';

export async function listPosts({
  boardId,
  projectId,
  sort = 'trending',
  limit = 50,
  status,
}: {
  boardId?: string;
  projectId: string;
  sort?: 'trending' | 'new' | 'top';
  limit?: number;
  status?: 'backlog' | 'planned' | 'in_progress' | 'completed' | 'closed';
}) {
  const { db } = getDatabase();

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

  const whereConditions = [eq(projects.id, projectId)];

  if (boardId) {
    whereConditions.push(eq(posts.boardId, boardId));
  }

  // Filter by non-archived posts by default
  whereConditions.push(eq(posts.isArchived, false));

  if (status) {
    whereConditions.push(eq(posts.status, status));
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

  // Check if slug already exists in this board
  const [existingPost] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.boardId, data.boardId), eq(posts.slug, data.slug)))
    .limit(1);

  if (existingPost) {
    throw new Error('Post with this slug already exists in this board');
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

export async function archivePost(postId: string) {
  const { db } = getDatabase();
  await db.update(posts).set({ isArchived: true }).where(eq(posts.id, postId));
}

export async function pinPost(postId: string, pinnedValue: boolean) {
  const { db } = getDatabase();
  await db
    .update(posts)
    .set({ pinned: pinnedValue })
    .where(eq(posts.id, postId));
}
