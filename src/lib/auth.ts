import { getDatabase } from '@/server/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  // Server base URL for callbacks; optional if same domain
  baseURL: process.env.BETTER_AUTH_URL,
  // Secret for signing; required in production
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(getDatabase().db, { provider: 'pg' }),
});


