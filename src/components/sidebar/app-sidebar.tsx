import { OrganizationSwitcher } from '@/components/organization/org-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { auth } from '@/server/auth';
import { Globe } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import * as React from 'react';
import { Button } from '../ui/button';
import { AppSidebarNav } from './app-sidebar-nav';
import { AppSidebarUserNav } from './app-sidebar-user-nav';

export async function AppSidebar({
  org,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  org: string;
}) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  const orgs = await auth.api.listOrganizations({ headers: h });

  const items = {
    main: [
      {
        name: 'Feedback',
        url: `/dashboard/feedback`,
        icon: 'ListTodo' as const,
      },
    ],
    organization: [
      {
        name: 'Settings',
        url: `/dashboard/settings`,
        icon: 'Settings' as const,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher orgs={orgs} />
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarNav title="Platform" items={items.main} />
        <AppSidebarNav title="Organization" items={items.organization} />
      </SidebarContent>
      {session?.user && (
        <SidebarFooter>
          <Link href={`/${org}/feedback`} passHref>
            <Button className="w-full justify-start" variant="ghost" size="sm">
              <Globe />
              Public site
            </Button>
          </Link>
          <AppSidebarUserNav user={session.user} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
