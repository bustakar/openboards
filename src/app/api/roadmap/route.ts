import { NextResponse } from "next/server";
import { getDatabase } from "@/server/db";
import { posts, boards } from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

type GroupKey = "backlog" | "planned" | "in_progress" | "completed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardSlug = searchParams.get("board");
  const { db } = getDatabase();

  let boardId: string | undefined = undefined;
  if (boardSlug && boardSlug !== "all") {
    const [b] = await db.select({ id: boards.id }).from(boards).where(eq(boards.slug, boardSlug)).limit(1);
    if (!b) return NextResponse.json({ error: "Board not found" }, { status: 404 });
    boardId = b.id;
  }

  const where = and(
    eq(posts.isArchived, false),
    boardId ? eq(posts.boardId, boardId) : sql`true`,
    inArray(posts.status, ["backlog", "planned", "in_progress", "completed"] as const),
  );

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      boardId: posts.boardId,
      status: posts.status,
      voteCount: posts.voteCount,
      pinned: posts.pinned,
    })
    .from(posts)
    .where(where)
    .orderBy(desc(posts.pinned), desc(posts.voteCount), desc(posts.lastActivityAt));

  const grouped: Record<GroupKey, typeof rows> = {
    backlog: [],
    planned: [],
    in_progress: [],
    completed: [],
  } as Record<GroupKey, typeof rows>;

  for (const r of rows) {
    if (r.status === "closed") continue;
    grouped[r.status as GroupKey].push(r);
  }

  return NextResponse.json(grouped);
}


