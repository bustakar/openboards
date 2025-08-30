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
  if (
    process.env.ENABLE_STRIPE_BILLING === 'true' &&
    (!accessInfo || !['active', 'trialing'].includes(accessInfo.access.status || ''))
  ) {
    redirect('/trial');
  }

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
          <Suspense>{children}</Suspense>
        </main>
      </ProjectSelector>
    </SidebarProvider>
  );
}
