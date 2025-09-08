'use client';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ListTodo, Settings } from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  ListTodo,
  Settings,
} as const;

export function AppSidebarNav({
  title,
  items,
}: {
  title: string;
  items: {
    name: string;
    url: string;
    icon: keyof typeof iconMap;
  }[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const IconComponent = iconMap[item.icon];
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <IconComponent />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
