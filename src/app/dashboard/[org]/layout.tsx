import { Breadcrumbs } from '@/components/breadcrumbs';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const h = await headers();
  const organizations = await auth.api.listOrganizations({ headers: h });

  if (organizations.length === 0) {
    redirect('/dashboard/organization/setup');
  }

  if (!organizations.some((organization) => organization.slug === org)) {
    redirect('/dashboard/organization/select');
  } else {
    await auth.api.setActiveOrganization({
      body: {
        organizationSlug: org,
      },
      headers: h,
    });
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Breadcrumbs />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
