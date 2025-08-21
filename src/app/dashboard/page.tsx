import { SignOutButton } from '@/components/auth/SignOutButton';
import { authOptions } from '@/server/auth/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Welcome, {session.user.email}</p>
      <SignOutButton />
    </main>
  );
}
