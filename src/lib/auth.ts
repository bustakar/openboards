import { getDatabase } from '@/server/db';
import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import 'dotenv/config';

const plugins: BetterAuthPlugin[] = [];

// Conditionally enable Stripe billing from EE module
if (process.env.ENABLE_STRIPE_BILLING === 'true') {
  try {
    // Dynamic import keeps EE code out of OSS builds
    const { initStripePlugin } = await import('../../ee/lib/stripe-plugin');
    const stripePlugin = initStripePlugin({
      secretKey: process.env.STRIPE_SECRET_KEY as string,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
      trialDays: Number(process.env.TRIAL_DAYS || 14),
      prices: {
        single: process.env.PRICE_SINGLE,
        multi3: process.env.PRICE_MULTI_3,
      multi10: process.env.PRICE_MULTI_10,
      },
    });
    plugins.push(stripePlugin);
  } catch (err) {
    console.warn('[billing] Stripe plugin not loaded:', err);
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  database: drizzleAdapter(getDatabase().db, { provider: 'pg' }),
  plugins,
});


