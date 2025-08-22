import { BoardsList } from '@/components/boards/BoardsList';
import { Nav } from '@/components/Nav';
import { listBoardsForProject } from '@/server/repos/boards/boards';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

async function fetchBoards(projectId: string) {
  const data = await listBoardsForProject(projectId);
  return data.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description ?? null,
    icon: b.icon ?? null,
    posts: b.postCount,
  }));
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);

  // If no project found, return 404
  if (!project) {
    notFound();
  }

  const boards = await fetchBoards(project.id);

  return (
    <div className="min-h-screen bg-background">
      <Nav title={project.name} />
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <BoardsList boards={boards} />
          </div>
          <div className="col-span-12 md:col-span-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  return {
    title: project.name,
    description: project.description || `Feedback and feature requests for ${project.name}`,
    openGraph: {
      title: project.name,
      description: project.description || `Feedback and feature requests for ${project.name}`,
      type: 'website',
    },
  };
}
