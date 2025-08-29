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
        options.prices.single && {
          name: 'single',
          priceId: options.prices.single,
          limits: { projects: 1 },
          freeTrial: { days: options.trialDays },
        },
        options.prices.multi3 && {
          name: 'multi_3',
          priceId: options.prices.multi3,
          limits: { projects: 3 },
          freeTrial: { days: options.trialDays },
        },
        options.prices.multi10 && {
          name: 'multi_10',
          priceId: options.prices.multi10,
          limits: { projects: 10 },
          freeTrial: { days: options.trialDays },
        },
      ].filter(Boolean) as Array<any>,
    },
  });
}
