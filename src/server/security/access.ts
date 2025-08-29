import { auth } from '@/lib/auth';
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
    // Better Auth Stripe plugin exposes a subscription model via its schema
    // Query latest active/trialing subscription for the user
    const { db, sql } = getDatabase();
    try {
      // The plugin exposes a subscription table named `subscription` by default
      // We will query via raw SQL to avoid tight coupling; if table missing, fall back
      const result = await sql`
        select plan, status, "trialEnd" as trial_end
        from subscription
        where "referenceId" = ${userId}
        order by "updatedAt" desc
        limit 1
      `;
      const row = (
        Array.isArray(result)
          ? (result as unknown[])[0]
          : (result as { rows?: unknown[] })?.rows?.[0]
      ) as { plan?: string; status?: string; trial_end?: Date } | undefined;
      plan = row?.plan ?? null;
      status = row?.status ?? null;
      trialEnd = row?.trial_end ?? null;

      const isActive = status === 'active' || status === 'trialing';
      canWrite = !!isActive;
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
          // No plan: read-only
          maxProjects = 0;
          canWrite = false;
      }
    } catch {
      // If any issue with schema, default to read-only safe mode
      canWrite = false;
      maxProjects = 0;
    }
  }

  return { userId, access: { canWrite, maxProjects, plan, status, trialEnd } };
}
