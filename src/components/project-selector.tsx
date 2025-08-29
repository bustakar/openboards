'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectSelectorProps {
  projects: Project[];
  children: React.ReactNode;
}

export function ProjectSelector({ projects, children }: ProjectSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProject = searchParams.get('project');

  useEffect(() => {
    // If no project is selected and we have projects, select the first one
    if (!currentProject && projects.length > 0) {
      const firstProject = projects[0];
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('project', firstProject.subdomain);
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [currentProject, projects, router]);

  return <>{children}</>;
}
