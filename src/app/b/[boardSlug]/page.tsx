import { PostsList } from '@/components/posts/PostsList';
import { getBoardBySlug } from '@/server/repos/boards';
import {
  listPosts,
  type PostSort,
  type PostStatus,
} from '@/server/repos/posts';
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

  // Format the posts data to include createdAt as ISO string
  const formattedPosts = data.items.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <PostsList
      posts={formattedPosts}
      basePath={`/b/${board.slug}`}
      boardSlug={board.slug}
      currentSort={sort}
      boardName={board.name}
    />
  );
}
