import { BoardsList, type BoardItem } from '@/components/boards/BoardsList';
import { PostsList } from '@/components/posts/PostsList';
import { getBoardBySlug, listBoardsWithStats } from '@/server/repos/boards';
import {
  listPosts,
  type PostSort,
  type PostStatus,
} from '@/server/repos/posts';
import { notFound } from 'next/navigation';

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

export default async function BoardPage(props: {
  params: Promise<{ boardSlug: string }>;
  searchParams?: Promise<{ status?: PostStatus; sort?: PostSort; q?: string }>;
}) {
  const params = await props.params;
  const sp = (await props.searchParams) ?? {};
  const board = await getBoardBySlug(params.boardSlug);
  if (!board) return notFound();

  const page = 1;
  const limit = 20;
  const sort = sp.sort ?? 'trending';
  const data = await listPosts({
    boardId: board.id,
    status: sp.status,
    sort,
    query: sp.q,
    page,
    limit,
  });

  const boards = await fetchBoards();

  // Format the posts data to include createdAt as ISO string
  const formattedPosts = data.items.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} selectedSlug={board.slug} />
        </div>
        <div className="col-span-12 md:col-span-8">
          <PostsList
            posts={formattedPosts}
            basePath={`/b/${board.slug}`}
            boardSlug={board.slug}
            currentSort={sort}
            boardName={board.name}
          />
        </div>
      </div>
    </main>
  );
}
