import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const { signIn, signUp, useSession } = createAuthClient({
  baseURL: process.env.AUTH_URL!,
  plugins: [organizationClient()],
});
