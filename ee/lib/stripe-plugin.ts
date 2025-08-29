import { stripe as betterAuthStripe } from '@better-auth/stripe';
import type { BetterAuthPlugin } from 'better-auth';
import Stripe from 'stripe';

export interface InitStripePluginOptions {
  secretKey: string;
  webhookSecret: string;
  trialDays: number;
  prices: {
    single: string | undefined;
    multi3: string | undefined;
    multi10: string | undefined;
  };
}

export function initStripePlugin(
  options: InitStripePluginOptions
): BetterAuthPlugin {
  const stripeClient = new Stripe(options.secretKey, {
    apiVersion: '2025-08-27.basil',
  });

  return betterAuthStripe({
    stripeClient,
    stripeWebhookSecret: options.webhookSecret,
    createCustomerOnSignUp: true,
    subscription: {
      enabled: true,
      plans: [
        {
          name: 'single',
          ...(options.prices.single
            ? { priceId: options.prices.single }
            : { lookupKey: 'PRICE_SINGLE' }),
          limits: { projects: 1 },
          freeTrial: { days: options.trialDays },
        },
        {
          name: 'multi_3',
          ...(options.prices.multi3
            ? { priceId: options.prices.multi3 }
            : { lookupKey: 'PRICE_MULTI_3' }),
          limits: { projects: 3 },
          freeTrial: { days: options.trialDays },
        },
        {
          name: 'multi_10',
          ...(options.prices.multi10
            ? { priceId: options.prices.multi10 }
            : { lookupKey: 'PRICE_MULTI_10' }),
          limits: { projects: 10 },
          freeTrial: { days: options.trialDays },
        },
      ],
    },
  });
}
