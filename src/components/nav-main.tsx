'use client';

import { type Icon } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            // Check if current path matches this item's URL
            let isActive = false;

            if (item.title === 'Feedback') {
              // Feedback is active if path ends with /dashboard or /dashboard/feedback
              isActive =
                pathname === '/dashboard' ||
                pathname === '/dashboard/feedback' ||
                pathname.startsWith('/dashboard/feedback/');
            } else if (item.title === 'Roadmap') {
              // Roadmap is active if path is /dashboard/roadmap
              isActive =
                pathname === '/dashboard/roadmap' ||
                pathname.startsWith('/dashboard/roadmap/');
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link
                    href={item.url}
                    className={
                      isActive ? 'bg-accent text-accent-foreground' : ''
                    }
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
