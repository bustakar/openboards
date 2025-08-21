import { BoardsList, type BoardItem } from '@/components/boards/BoardsList';
import { PostsList } from '@/components/posts/PostsList';
import { listBoardsWithStats } from '@/server/repos/boards';
import { listPosts } from '@/server/repos/posts';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects';
import { SelectProjectClient } from '@/components/projects/SelectProjectClient';

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

export default async function Home(props: {
  searchParams?: Promise<{ sort?: 'trending' | 'new' | 'top' }>;
}) {
  const project = await getCurrentProjectFromHeaders();
  if (!project) {
    // Load available projects for the selector
    const { getDatabase } = await import('@/server/db');
    const { projects } = await import('@/db/schema');
    const { asc } = await import('drizzle-orm');
    const { db } = getDatabase();
    const rows = await db
      .select({ id: projects.id, name: projects.name, subdomain: projects.subdomain })
      .from(projects)
      .orderBy(asc(projects.subdomain));
    return (
      <main>
        <SelectProjectClient projects={rows} />
      </main>
    );
  }
  const boards = await fetchBoards();
  const sp = (await props.searchParams) ?? {};
  const sort = sp.sort ?? 'trending';
  // Get all posts across all boards within current project
  const allBoardsData = await Promise.all(
    boards.map(async (board) => {
      const data = await listPosts({
        boardId: board.id,
        sort,
        limit: 10,
      });
      return data.items.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        boardSlug: board.slug,
      }));
    })
  );

  // Flatten and sort by the specified sort order
  const allPosts = allBoardsData
    .flat()
    .sort((a, b) => {
      switch (sort) {
        case 'new':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'top':
          return b.voteCount - a.voteCount;
        case 'trending':
        default:
          // Simple trending score: votes + recency factor
          const aScore =
            a.voteCount + new Date(a.createdAt).getTime() / 1000000;
          const bScore =
            b.voteCount + new Date(b.createdAt).getTime() / 1000000;
          return bScore - aScore;
      }
    })
    .slice(0, 10);
  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} selectedSlug={undefined} />
        </div>
        <div className="col-span-12 md:col-span-8">
          <PostsList
            posts={allPosts}
            basePath="/"
            currentSort={sort}
            boardName="All posts"
          />
        </div>
      </div>
    </main>
  );
}
