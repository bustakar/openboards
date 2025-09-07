import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/server/auth';
import { getUserMembershipCount } from '@/server/org-repo';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headers = await import('next/headers').then((h) => h.headers());
  const session = await auth.api.getSession({ headers });

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;
  const membershipCount = await getUserMembershipCount(userId);

  if (membershipCount === 0) {
    redirect('/onboarding/organization');
  }

  return (
    <div>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '350px',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
