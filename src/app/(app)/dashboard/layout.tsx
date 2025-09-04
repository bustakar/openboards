import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((h) => h.headers()),
  });

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
