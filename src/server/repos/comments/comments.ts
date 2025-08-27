import { boards, comments, posts, projects } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { and, asc, eq, sql } from 'drizzle-orm';

export async function listComments(postId: string) {
  const { db } = getDatabase();
  return db
    .select({
      id: comments.id,
      body: comments.body,
      authorName: comments.authorName,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.isArchived, false)))
    .orderBy(asc(comments.createdAt));
}

export async function createComment(params: {
  postId: string;
  visitorId: string;
  authorName?: string | null;
  body: string;
}) {
  const { db } = getDatabase();
  const [b] = await db
    .select({ projectId: boards.projectId })
    .from(posts)
    .leftJoin(boards, eq(posts.boardId, boards.id))
    .where(eq(posts.id, params.postId))
    .limit(1);
  if (!b || !b.projectId) throw new Error('post_not_found');
  const [row] = await db
    .insert(comments)
    .values({
      postId: params.postId,
      projectId: b.projectId,
      visitorId: params.visitorId,
      authorName: params.authorName ?? null,
      body: params.body,
    })
    .returning();

  await db
    .update(posts)
    .set({
      commentCount: sql`${posts.commentCount} + 1`,
      lastActivityAt: sql`now()`,
    })
    .where(eq(posts.id, params.postId));

  return row;
}

export async function updateComment(
  commentId: string,
  updates: { isArchived?: boolean },
  userId: string
) {
  const { db } = getDatabase();

  try {
    // First check if the user has permission to update this comment
    // (user can update comments on posts in their projects)
    const existingComment = await db
      .select({
        comment: comments,
        post: posts,
        project: projects,
      })
      .from(comments)
      .innerJoin(posts, eq(comments.postId, posts.id))
      .innerJoin(projects, eq(posts.projectId, projects.id))
      .where(and(eq(comments.id, commentId), eq(projects.userId, userId)))
      .limit(1);

    if (existingComment.length === 0) {
      return null;
    }

    // Update the comment
    const [updatedComment] = await db
      .update(comments)
      .set({
        isArchived: updates.isArchived,
      })
      .where(eq(comments.id, commentId))
      .returning();

    return updatedComment;
  } catch (error) {
    console.error('Error updating comment:', error);
    return null;
  }
}
