import { desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/server/db";
import { boards, posts } from "@/db/schema";

export async function listBoardsWithStats() {
  const { db } = getDatabase();
  const result = await db
    .select({
      id: boards.id,
      name: boards.name,
      slug: boards.slug,
      description: boards.description,
      icon: boards.icon,
      position: boards.position,
      posts: sql<number>`count(*) FILTER (WHERE ${posts.isArchived} = false)`.as("posts"),
      open: sql<number>`count(*) FILTER (WHERE ${posts.status} IN ('backlog','planned','in_progress') AND ${posts.isArchived} = false)`.as(
        "open",
      ),
      inProgress: sql<number>`count(*) FILTER (WHERE ${posts.status} = 'in_progress' AND ${posts.isArchived} = false)`.as(
        "inProgress",
      ),
      planned: sql<number>`count(*) FILTER (WHERE ${posts.status} = 'planned' AND ${posts.isArchived} = false)`.as(
        "planned",
      ),
      completed: sql<number>`count(*) FILTER (WHERE ${posts.status} = 'completed' AND ${posts.isArchived} = false)`.as(
        "completed",
      ),
    })
    .from(boards)
    .leftJoin(posts, eq(posts.boardId, boards.id))
    .groupBy(boards.id)
    .orderBy(desc(boards.position));

  return result;
}

export async function getBoardBySlug(slugValue: string) {
  const { db } = getDatabase();
  const [row] = await db.select().from(boards).where(eq(boards.slug, slugValue)).limit(1);
  return row ?? null;
}


