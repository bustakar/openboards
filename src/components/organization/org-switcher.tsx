'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSelect(organization: Organization) {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await authClient.organization.setActive({
        organizationId: organization.id,
      });
      router.push(`/dashboard/${organization.slug}/feedback`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to switch organization'
      );
    } finally {
      setBusy(false);
    }
  }

  function handleAdd() {
    if (busy) return;
    router.push('/dashboard/organization/setup');
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
                <span className="truncate text-xs">{activeOrg?.slug}</span>
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
            {orgs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSelect(org)}
                disabled={busy || org.id === activeOrg?.id}
                className="gap-2 p-2"
              >
                <span className="flex-1">{org.name}</span>
                {org.id === activeOrg?.id && (
                  <Check className="size-3.5 opacity-60" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={handleAdd}
              disabled={busy}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add organization
              </div>
            </DropdownMenuItem>
            {error && (
              <div className="text-destructive text-xs px-2 py-1">{error}</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
