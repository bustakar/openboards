'use client';

import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';

export type ProjectOption = { id: string; name: string; subdomain: string };

export function SelectProjectClient({
  projects,
}: {
  projects: ProjectOption[];
}) {
  const [selected, setSelected] = useState<string>(
    projects[0]?.subdomain ?? ''
  );

  const hasProjects = projects.length > 0;
  const options = useMemo(
    () =>
      projects.map((p) => ({
        label: `${p.name} (${p.subdomain})`,
        value: p.subdomain,
      })),
    [projects]
  );

  function goToProject() {
    if (!selected) return;
    const host = window.location.host;
    const protocol = window.location.protocol;
    const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'openboards.co';
    // Local dev patterns
    if (host.includes('localhost')) {
      window.location.href = `${protocol}//${selected}.localhost:3000/`;
      return;
    }
    if (host.endsWith('lvh.me') || host.includes('lvh.me:')) {
      const port = host.includes(':') ? `:${host.split(':')[1]}` : '';
      window.location.href = `${protocol}//${selected}.lvh.me${port}/`;
      return;
    }
    // Production: project subdomain on root domain
    window.location.href = `https://${selected}.${root}/`;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-semibold mb-2">Select a project</h1>
        <p className="text-sm text-gray-600 mb-4">
          Choose which project to view. You can manage projects in the admin
          app.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!hasProjects}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            {!hasProjects && <option value="">No projects found</option>}
          </select>
          <Button onClick={goToProject} disabled={!hasProjects}>
            Go
          </Button>
        </div>
        {!hasProjects && (
          <div className="text-xs text-muted-foreground mt-3">
            Create a project via CLI, then refresh this page.
          </div>
        )}
      </div>
    </div>
  );
}
