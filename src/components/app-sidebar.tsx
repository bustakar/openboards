'use client';

import {
  IconChevronDown,
  IconExternalLink,
  IconMessageCircle,
  IconRoad,
  IconSettings,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface Project {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  projects?: Project[];
}

export function AppSidebar({ user, projects = [], ...props }: AppSidebarProps) {
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');
  const selectedProject = projects.find((p) => p.subdomain === projectSlug);

  // Build origin for a given subdomain using current protocol and port in dev
  const getOriginForSubdomain = (sub: string) => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol; // http: or https:
      const hostname = window.location.hostname;
      const port = window.location.port;
      const rootDomain = hostname.replace(/^[^.]+\./, '');
      const hostWithPort = port
        ? `${sub}.${rootDomain}:${port}`
        : `${sub}.${rootDomain}`;
      return `${protocol}//${hostWithPort}`;
    }
    const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'openboards.co';
    return `https://${sub}.${root}`;
  };

  const getNavData = () => {
    const projectParam = selectedProject
      ? `?project=${selectedProject.subdomain}`
      : '';
    return {
      navMain: [
        {
          title: 'Feedback',
          url: `/dashboard/feedback${projectParam}`,
          icon: IconMessageCircle,
        },
        {
          title: 'Roadmap',
          url: `/dashboard/roadmap${projectParam}`,
          icon: IconRoad,
        },
      ],
      navSecondary: [
        {
          title: 'Settings',
          url: `/dashboard/settings${projectParam}`,
          icon: IconSettings,
        },
      ],
    };
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="text-base font-semibold">
                      {selectedProject?.name || 'Select Project'}
                    </span>
                    <IconChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {projects.map((project) => (
                    <DropdownMenuItem key={project.id} asChild>
                      <Link
                        className={
                          selectedProject?.id === project.id ? 'bg-accent' : ''
                        }
                        href={`/dashboard/feedback?project=${project.subdomain}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{project.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {project.subdomain}.openboards.co
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild>
                    <a href="/setup" className="text-blue-600">
                      + Create New Project
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavData().navMain} />
      </SidebarContent>
      <SidebarFooter>
        {selectedProject && (
          <div className="p-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                const origin = getOriginForSubdomain(selectedProject.subdomain);
                window.open(origin, '_blank');
              }}
            >
              <IconExternalLink className="h-4 w-4" />
              Open Project
            </Button>
          </div>
        )}
        {user && <NavUser user={{ ...user, avatar: user.avatar || '' }} />}
      </SidebarFooter>
    </Sidebar>
  );
}
