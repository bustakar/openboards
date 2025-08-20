import { BoardsList, type BoardItem } from '@/components/boards/BoardsList';
import { PostsList, type PostItem } from '@/components/posts/PostsList';
import Link from 'next/link';
import { getDatabase } from '@/server/db';
import { posts } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

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
  const { db } = getDatabase();
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      voteCount: posts.voteCount,
      commentCount: posts.commentCount,
      lastActivityAt: posts.lastActivityAt,
      isArchived: posts.isArchived,
    })
    .from(posts)
    .where(eq(posts.isArchived, false))
    .orderBy(
      desc(sql`(${posts.voteCount} * 1.0) + (extract(epoch from ${posts.lastActivityAt}) / 100000)`)
    )
    .limit(10);
  const allPosts: PostItem[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    status: r.status as PostItem['status'],
    voteCount: r.voteCount,
    commentCount: r.commentCount,
  }));
  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} selectedSlug={undefined} />
        </div>
        <div className="col-span-12 md:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">All posts</h2>
            {boards[0]?.slug ? (
              <Link
                href={`/b/${boards[0].slug}/new`}
                className="text-sm hover:underline"
              >
                New post
              </Link>
            ) : null}
          </div>
          {/* Link targets will be resolved on detail by slug; board context provided by route */}
          <PostsList posts={allPosts} boardSlug={boards[0]?.slug ?? 'features'} />
        </div>
      </div>
    </main>
  );
}
