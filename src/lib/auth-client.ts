import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  // baseURL can be omitted when using the same domain
  plugins: process.env.NEXT_PUBLIC_ENABLE_STRIPE_BILLING === 'true'
    ? [
        // dynamic import via function ensures no top-level await
        (() => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { stripeClient } = require('@better-auth/stripe/client');
          return stripeClient({ subscription: true });
        })(),
      ]
    : [],
});


