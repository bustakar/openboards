'use server';

import { db } from '@/db/index';
import * as schema from '@/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink, organization } from 'better-auth/plugins';
// import nodemailer from 'nodemailer';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
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
        // TODO: Implement email sending
        // await transporter.sendMail({
        //   to: email,
        //   from: process.env.EMAIL_FROM!,
        //   subject: 'Sign in to Openboards',
        //   html: `<p>Click to sign in:</p><p><a href="${url}">${url}</a></p>`,
        //   text: `Sign in: ${url}`,
        // });
      },
    }),
  ],
});
