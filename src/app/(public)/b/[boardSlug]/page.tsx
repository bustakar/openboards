import { PostsList } from '@/components/posts/PostsList';
import { getBoardBySlug } from '@/server/repos/boards/boards';
import { listPosts } from '@/server/repos/posts/posts';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function BoardPage(props: {
  params: Promise<{ boardSlug: string }>;
  searchParams?: Promise<{ status?: string; sort?: string; q?: string }>;
}) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);
  if (!project) return notFound();
  const params = await props.params;
  const board = await getBoardBySlug(params.boardSlug);
  if (!board) return notFound();
  const posts = await listPosts({ boardId: board.id, projectId: project.id });

  // Format the posts data to include createdAt as ISO string
  const formattedPosts = posts.items.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <main className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{board.name}</h1>
        {board.description && (
          <p className="text-muted-foreground mt-2">{board.description}</p>
        )}
      </div>

      <PostsList
        posts={formattedPosts}
        basePath={`/b/${board.slug}`}
        boardSlug={board.slug}
        currentSort="trending"
        boardName={board.name}
      />
    </main>
  );
}
