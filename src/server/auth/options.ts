import { users } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { compare } from '@/server/security/password';
import { eq } from 'drizzle-orm';
import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { db } = getDatabase();
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, String(credentials.email).toLowerCase()))
          .limit(1);
        if (!user) return null;
        const ok = await compare(
          String(credentials.password),
          user.passwordHash
        );
        if (!ok) return null;
        return { id: user.id, email: user.email } as NextAuthUser;
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      // token.sub is already set by NextAuth for User.id; ensure presence
      if (
        user &&
        'id' in user &&
        typeof (user as { id?: unknown }).id === 'string'
      ) {
        token.sub = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        (session.user as { id?: string }).id = String(token.sub);
      }
      return session;
    },
  },
};
