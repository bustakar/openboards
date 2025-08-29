import { subscription as subscriptionTable, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/server/db';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST() {
  if (process.env.ENABLE_STRIPE_BILLING !== 'true') {
    return NextResponse.json({ error: 'billing_disabled' }, { status: 404 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const userId = session.user.id as string;

  const secretKey = process.env.STRIPE_SECRET_KEY as string | undefined;
  const priceEnv = process.env.PRICE_SINGLE || 'PRICE_SINGLE';
  const trialDays = Number(process.env.TRIAL_DAYS || 14);
  if (!secretKey) {
    return NextResponse.json({ error: 'missing_stripe_key' }, { status: 500 });
  }

  const { db } = getDatabase();
  const [u] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' });

  // Ensure customer exists
  let customerId = u?.stripeCustomerId ?? null;
  if (!customerId) {
    const created = await stripe.customers.create({
      email: u?.email || undefined,
      name: u?.name || undefined,
      metadata: { userId },
    });
    customerId = created.id;
    await db
      .update(user)
      .set({ stripeCustomerId: customerId })
      .where(eq(user.id, userId));
  }

  // Resolve a valid price ID
  let priceId = priceEnv;
  if (!priceId.startsWith('price_')) {
    const list = await stripe.prices.list({
      lookup_keys: [priceId],
      active: true,
      limit: 1,
    });
    priceId = list.data[0]?.id || '';
    if (!priceId)
      return NextResponse.json({ error: 'price_not_found' }, { status: 400 });
  }

  const sub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
  });

  // Upsert local subscription row so access switches to trialing immediately
  const subAny = sub as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
  };
  const periodStart: Date | null =
    typeof subAny.current_period_start === 'number'
      ? new Date(
          (sub as unknown as { current_period_start: number })
            .current_period_start * 1000
        )
      : null;
  const periodEnd: Date | null =
    typeof subAny.current_period_end === 'number'
      ? new Date(subAny.current_period_end * 1000)
      : null;
  await db
    .insert(subscriptionTable)
    .values({
      id: sub.id,
      plan: 'single',
      referenceId: userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      status: (sub.status || 'trialing') as string,
      periodStart: periodStart ?? undefined,
      periodEnd: periodEnd ?? undefined,
      cancelAtPeriodEnd: subAny.cancel_at_period_end ?? undefined,
    })
    .onConflictDoUpdate({
      target: subscriptionTable.id,
      set: {
        plan: 'single',
        referenceId: userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        status: (sub.status || 'trialing') as string,
        periodStart: periodStart ?? undefined,
        periodEnd: periodEnd ?? undefined,
        cancelAtPeriodEnd: subAny.cancel_at_period_end ?? undefined,
      },
    });

  return NextResponse.json({ id: sub.id });
}
