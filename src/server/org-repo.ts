import { db } from '@/db/index';
import * as schema from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function getUserMembershipCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.member)
    .where(eq(schema.member.userId, userId));

  return Number(row?.count ?? 0);
}
