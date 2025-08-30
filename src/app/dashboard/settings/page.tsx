import { CustomDomainCard } from '@/components/projects/CustomDomainCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { listProjectsByUser } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/login');
  const userId = session.user.id as string | undefined;
  if (!userId) redirect('/login');
  const projects = await listProjectsByUser(userId);
  if (projects.length === 0) redirect('/setup');

  // Pick current project via search param later; for now show first
  const project = projects[0];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{project.name}</div>
          <div className="text-sm text-muted-foreground">
            {project.subdomain}.openboards.co
          </div>
        </CardContent>
      </Card>

      <CustomDomainCard projectId={project.id} subdomain={project.subdomain} />
    </div>
  );
}
