import { db } from '@/db/index';
import * as schema from '@/db/schema';
import { sendMagicLinkEmail } from '@/server/email';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink, organization } from 'better-auth/plugins';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    organization(),
    magicLink({
      async sendMagicLink({ email, url }) {
        await sendMagicLinkEmail(email, url);
      },
    }),
  ],
});
