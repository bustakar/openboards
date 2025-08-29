import { subscription } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { getDatabase } from '../db';

export type Access = {
  canWrite: boolean;
  maxProjects: number;
  plan?: string | null;
  status?: string | null;
  trialEnd?: Date | null;
};

export async function getAccess(): Promise<{
  userId: string;
  access: Access;
} | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const userId = session.user.id as string;

  // Default for OSS mode: unlimited read-only false
  let canWrite = true;
  let maxProjects = Number.MAX_SAFE_INTEGER;
  let plan: string | null = null;
  let status: string | null = null;
  let trialEnd: Date | null = null;

  if (process.env.ENABLE_STRIPE_BILLING === 'true') {
    const { db } = getDatabase();
    try {
      const preferred = await db
        .select({
          plan: subscription.plan,
          status: subscription.status,
          periodEnd: subscription.periodEnd,
        })
        .from(subscription)
        .where(
          and(
            eq(subscription.referenceId, userId),
            inArray(subscription.status, ['active', 'trialing'])
          )
        )
        .limit(1);
      const rows = preferred.length
        ? preferred
        : await db
            .select({
              plan: subscription.plan,
              status: subscription.status,
              periodEnd: subscription.periodEnd,
            })
            .from(subscription)
            .where(eq(subscription.referenceId, userId))
            .orderBy(desc(subscription.periodEnd))
            .limit(1);
      const row = rows[0];
      if (process.env.NODE_ENV !== 'production') {
        console.log('[access]', { userId, row });
      }
      plan = row?.plan ?? null;
      status = row?.status ?? null;
      trialEnd = row?.periodEnd ?? null;

      const isActive = status === 'active' || status === 'trialing';
      canWrite = isActive;
      switch (plan) {
        case 'single':
          maxProjects = 1;
          break;
        case 'multi_3':
          maxProjects = 3;
          break;
        case 'multi_10':
          maxProjects = 10;
          break;
        default:
          maxProjects = 0;
          canWrite = false;
      }
    } catch {
      canWrite = false;
      maxProjects = 0;
    }
  }

  return { userId, access: { canWrite, maxProjects, plan, status, trialEnd } };
}
