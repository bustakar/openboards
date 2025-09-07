'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { Organization } from 'better-auth/plugins/organization';
import { Check, ChevronsUpDown, Command, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export function OrganizationSwitcher({ orgs }: { orgs: Organization[] }) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const activeOrg = authClient.useActiveOrganization().data;

  async function handleSelect(id: string) {
    await authClient.organization.setActive({
      organizationId: id,
    });
  }

  function handleAdd() {
    router.push('/onboarding/organization');
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Command className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="truncate font-medium">{activeOrg?.name}</span>
                <span className="truncate text-xs">Organization</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {orgs.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSelect(org.id)}
                disabled={org.id === activeOrg?.id}
                className="gap-2 p-2"
              >
                <span className="flex-1">{org.name}</span>
                {org.id === activeOrg?.id ? (
                  <Check className="size-3.5 opacity-60" />
                ) : (
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={handleAdd}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
