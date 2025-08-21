import { BoardsList, type BoardItem } from '@/components/boards/BoardsList';
import { listBoardsWithStats } from '@/server/repos/boards';

async function fetchBoards(): Promise<BoardItem[]> {
  const data = await listBoardsWithStats();
  return data.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    description: b.description ?? null,
    icon: b.icon ?? null,
    posts: Number(b.posts ?? 0),
  }));
}

export default async function BoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ boardSlug: string }>;
}) {
  const { boardSlug } = await params;
  const boards = await fetchBoards();

  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} selectedSlug={boardSlug} />
        </div>
        <div className="col-span-12 md:col-span-8">
          {children}
        </div>
      </div>
    </main>
  );
}
