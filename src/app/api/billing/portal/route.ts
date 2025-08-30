import { user } from '@/db/schema';
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

  const { db } = getDatabase();
  const [u] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  let stripeCustomerId = u?.stripeCustomerId ?? null;

  const secretKey = process.env.STRIPE_SECRET_KEY as string | undefined;
  if (!secretKey) {
    return NextResponse.json({ error: 'missing_stripe_key' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' });

  // Lazily create a Stripe customer for existing users without one
  if (!stripeCustomerId) {
    const created = await stripe.customers.create({
      email: u?.email || undefined,
      name: u?.name || undefined,
      metadata: { userId },
    });
    stripeCustomerId = created.id;
    await db.update(user).set({ stripeCustomerId }).where(eq(user.id, userId));
  }

  const originHeader = (await headers()).get('origin') || '';
  const base =
    originHeader || process.env.BETTER_AUTH_URL || 'http://localhost:3000';

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${base}/dashboard/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const lower = message.toLowerCase();
    if (lower.includes('customer portal') || lower.includes('portal')) {
      return NextResponse.json(
        { error: 'portal_not_configured' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'internal_error', message },
      { status: 500 }
    );
  }
}
