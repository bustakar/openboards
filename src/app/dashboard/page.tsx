import { Button } from '@/components/ui/button';
import { authOptions } from '@/server/auth/options';
import NextAuth from 'next-auth';

export default async function DashboardPage() {
  const { auth, signOut } = NextAuth(authOptions);
  const session = await auth();
  if (!session?.user) {
    // Redirect via client since pages is a server component
    return (
      <main className="container mx-auto p-6">
        <p>You are not signed in.</p>
        <a className="underline" href="/login">
          Go to login
        </a>
      </main>
    );
  }
  async function doSignOut() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Welcome, {session.user.email}</p>
      <form action={doSignOut}>
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </main>
  );
}
