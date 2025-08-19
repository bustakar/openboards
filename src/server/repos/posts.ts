import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { getDatabase } from "@/server/db";
import { posts } from "@/db/schema";

export type PostSort = "trending" | "new" | "top";
export type PostStatus = "backlog" | "planned" | "in_progress" | "completed" | "closed";

function buildSearchWhere(boardId: string, opts: { status?: PostStatus; query?: string }) {
  const conditions = [eq(posts.boardId, boardId), eq(posts.isArchived, false)];
  if (opts.status) conditions.push(eq(posts.status, opts.status));
  if (opts.query && opts.query.trim().length > 0) {
    const q = `%${opts.query.trim()}%`;
    conditions.push(ilike(posts.title, q));
  }
  return and(...conditions);
}

function orderBy(sort: PostSort) {
  switch (sort) {
    case "new":
      return [desc(posts.createdAt)];
    case "top":
      return [desc(posts.voteCount), desc(posts.lastActivityAt)];
    case "trending":
    default:
      return [
        // simple hot score approximation: voteCount weight + recency
        desc(sql`(${posts.voteCount} * 1.0) + (extract(epoch from ${posts.lastActivityAt}) / 100000)`),
      ];
  }
}

export async function listPosts(params: {
  boardId: string;
  status?: PostStatus;
  query?: string;
  sort?: PostSort;
  page?: number;
  limit?: number;
}) {
  const { db } = getDatabase();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 20));
  const offset = (page - 1) * limit;
  const sort = params.sort ?? "trending";

  const where = buildSearchWhere(params.boardId, { status: params.status, query: params.query });

  const items = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      voteCount: posts.voteCount,
      commentCount: posts.commentCount,
      pinned: posts.pinned,
      isArchived: posts.isArchived,
      lastActivityAt: posts.lastActivityAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(where)
    .orderBy(...orderBy(sort))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(where);

  return { items, page, limit, total: Number(count) };
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

export async function createPost(params: { boardId: string; title: string; body?: string | null }) {
  const { db } = getDatabase();
  const slug = slugify(params.title);
  const [inserted] = await db
    .insert(posts)
    .values({
      boardId: params.boardId,
      title: params.title,
      body: params.body ?? null,
      slug,
      status: "backlog",
    })
    .returning();
  return inserted;
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

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}


