import { BoardsList, type BoardItem } from '@/components/boards/BoardsList';
import { PostsList, type PostItem } from '@/components/posts/PostsList';
import Link from 'next/link';

async function fetchBoards(): Promise<BoardItem[]> {
  // Prefer SSR: fetch from API route which will be wired later; fallback to empty
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/boards`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      posts?: number;
    }>;
    return data.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description ?? null,
      posts: b.posts,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const boards = await fetchBoards();
  const primaryBoardSlug = boards[0]?.slug ?? 'features';
  let posts: PostItem[] = [];
  // Fetch a small set of trending posts for the first board
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL ?? ''
      }/api/boards/${encodeURIComponent(
        primaryBoardSlug
      )}/posts?sort=trending&limit=6`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = (await res.json()) as { items: PostItem[] };
      posts = data.items ?? [];
    }
  } catch {}
  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} selectedSlug={undefined} />
        </div>
        <div className="col-span-12 md:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">All posts</h2>
            <Link
              href={`/b/${primaryBoardSlug}/new`}
              className="text-sm hover:underline"
            >
              New post
            </Link>
          </div>
          <PostsList posts={posts} boardSlug={primaryBoardSlug} />
        </div>
      </div>
    </main>
  );
}
