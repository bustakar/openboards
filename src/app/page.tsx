import { BoardsList, type BoardItem } from '@/components/boards/BoardsList';
import { PostsList, type PostItem } from '@/components/posts/PostsList';

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
  const posts: PostItem[] = [];
  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} />
        </div>
        <div className="col-span-12 md:col-span-8">
          <PostsList posts={posts} boardSlug={boards[0]?.slug ?? 'features'} />
        </div>
      </div>
    </main>
  );
}
