import { and, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/server/db";
import { votes, posts } from "@/db/schema";

export async function toggleVote(postId: string, visitorId: string) {
  const { db } = getDatabase();
  const existing = await db
    .select({ id: votes.id })
    .from(votes)
    .where(and(eq(votes.postId, postId), eq(votes.visitorId, visitorId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(votes).where(eq(votes.id, existing[0].id));
    const [row] = await db
      .update(posts)
      .set({ voteCount: sql`${posts.voteCount} - 1`, lastActivityAt: sql`now()` })
      .where(eq(posts.id, postId))
      .returning({ voteCount: posts.voteCount });
    return { voted: false, voteCount: row?.voteCount ?? 0 } as const;
  }

  await db.insert(votes).values({ postId, visitorId });
  const [row] = await db
    .update(posts)
    .set({ voteCount: sql`${posts.voteCount} + 1`, lastActivityAt: sql`now()` })
    .where(eq(posts.id, postId))
    .returning({ voteCount: posts.voteCount });
  return { voted: true, voteCount: row?.voteCount ?? 0 } as const;
}


