'use client';

import {
  IconChevronDown,
  IconMessageCircle,
  IconRoad,
  IconSettings,
} from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
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
import Link from 'next/link';

const navData = {
  navMain: [
    {
      title: 'Feedback',
      url: '/dashboard/feedback',
      icon: IconMessageCircle,
    },
    {
      title: 'Roadmap',
      url: '/dashboard/roadmap',
      icon: IconRoad,
    },
  ],
};

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
  const projectId = searchParams.get('project');
  const selectedProject = projects.find((p) => p.id === projectId);

  const getNavData = () => {
    const projectParam = selectedProject
      ? `?project=${selectedProject.id}`
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
                    <DropdownMenuItem asChild>
                      <Link
                        key={project.id}
                        className={
                          selectedProject?.id === project.id ? 'bg-accent' : ''
                        }
                        href={`/dashboard/feedback?project=${project.id}`}
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
        {user && <NavUser user={{ ...user, avatar: user.avatar || '' }} />}
      </SidebarFooter>
    </Sidebar>
  );
}
