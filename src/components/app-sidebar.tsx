import { OrganizationSwitcher } from '@/components/organization-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { auth } from '@/server/auth';
import * as React from 'react';
import { NavUser } from './user-nav-button';

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const headers = await import('next/headers').then((h) => h.headers());
  const session = await auth.api.getSession({ headers });
  const orgs = await auth.api.listOrganizations({ headers });

  console.log(session);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <OrganizationSwitcher orgs={orgs} />
        </SidebarHeader>
        <SidebarContent></SidebarContent>
        {session?.user && (
          <SidebarFooter>
            <NavUser user={session.user} />
          </SidebarFooter>
        )}
      </Sidebar>
      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div>Header</div>
        </SidebarHeader>
        <SidebarContent className="gap-3.5 border-b p-4">
          <div>Content</div>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
