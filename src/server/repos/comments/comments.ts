import { and, asc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/server/db";
import { boards, comments, posts } from "@/db/schema";

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
  if (!b || !b.projectId) throw new Error("post_not_found");
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
    .set({ commentCount: sql`${posts.commentCount} + 1`, lastActivityAt: sql`now()` })
    .where(eq(posts.id, params.postId));

  return row;
}


