import { AppSidebar } from '@/components/app-sidebar';
import { ProjectSelector } from '@/components/project-selector';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth';
import { listProjectsByUser } from '@/server/repos/projects/projects';
import { getAccess } from '@/server/security/access';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/login');
  const userId = session.user.id as string | undefined;
  if (!userId) redirect('/login');
  const projects = await listProjectsByUser(userId);
  if (projects.length === 0) redirect('/setup');
  const accessInfo = await getAccess();

  return (
    <SidebarProvider>
      <ProjectSelector projects={projects}>
        <Suspense>
          <AppSidebar
            user={{
              name: session.user.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              avatar: session.user.image || undefined,
            }}
            projects={projects}
          />
        </Suspense>
        <main className="w-full">
          <SidebarTrigger />
          {process.env.ENABLE_STRIPE_BILLING === 'true' && accessInfo &&
            !accessInfo.access.canWrite && (
              <div className="mx-4 mt-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                Your account is in read-only mode. Start your 14-day trial or manage your plan in{' '}
                <a className="underline" href="/dashboard/billing">Billing</a>.
              </div>
            )}
          <Suspense>{children}</Suspense>
        </main>
      </ProjectSelector>
    </SidebarProvider>
  );
}
