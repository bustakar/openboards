import { Nav } from '@/components/Nav';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);
  const title = project?.name || 'OpenBoards';

  return (
    <div className="min-h-screen bg-background">
      <Nav title={title} />
      {children}
    </div>
  );
}
