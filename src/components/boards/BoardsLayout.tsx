import { listBoardsForProject } from '@/server/repos/boards/boards';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';
import { BoardsList } from './BoardsList';

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

interface BoardsLayoutProps {
  children: React.ReactNode;
  selectedSlug?: string;
}

export async function BoardsLayout({
  children,
  selectedSlug,
}: BoardsLayoutProps) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);

  if (!project) {
    throw new Error('Project not found');
  }

  const boards = await fetchBoards(project.id);

  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} selectedSlug={selectedSlug} />
        </div>
        <div className="col-span-12 md:col-span-8">{children}</div>
      </div>
    </main>
  );
}
