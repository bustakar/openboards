import { BoardsList } from '@/components/boards/BoardsList';
import { PostsList } from '@/components/posts/PostsList';
import { Button } from '@/components/ui/button';
import { getBoardBySlug } from '@/server/repos/boards';
import {
  listPosts,
  type PostSort,
  type PostStatus,
} from '@/server/repos/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          {/* Highlight selected board on the left */}
          {/* We need boards to render; fetch via API for SSR parity */}
          {/* Using clientless SSR fetch keeps layout consistent with home */}
          <BoardsFetcher selectedSlug={board.slug} />
        </div>
        <div className="col-span-12 md:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{board.name}</h2>
            <Link href="/new">
              <Button>New post</Button>
            </Link>
          </div>
          <PostsList
            posts={data.items}
            basePath={`/b/${board.slug}`}
            boardSlug={board.slug}
            currentSort={sort}
          />
        </div>
      </div>
    </main>
  );
}

async function BoardsFetcher({ selectedSlug }: { selectedSlug?: string }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/boards`,
    { cache: 'no-store' }
  );
  const boards: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    posts?: number;
  }> = res.ok ? await res.json() : [];
  return <BoardsList boards={boards} selectedSlug={selectedSlug} />;
}
