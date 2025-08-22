import { Nav } from '@/components/Nav';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects';

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const project = await getCurrentProjectFromHeaders();
  const title = project?.name ?? 'OpenBoards';

  return (
    <>
      <Nav title={title} />
      {children}
    </>
  );
}

