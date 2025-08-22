'use client';

import { IconMessageCircle, IconRoad, IconSettings, IconChevronDown } from '@tabler/icons-react';
import * as React from 'react';
import { useState } from 'react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  navSecondary: [
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: IconSettings,
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    projects.length > 0 ? projects[0] : null
  );

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    // TODO: Update the current project context
    // This could involve updating a global state or URL parameter
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
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className={selectedProject?.id === project.id ? 'bg-accent' : ''}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {project.subdomain}.openboards.co
                        </span>
                      </div>
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
        <NavMain items={navData.navMain} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={{ ...user, avatar: user.avatar || '' }} />}
      </SidebarFooter>
    </Sidebar>
  );
}
