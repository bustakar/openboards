import { BoardsList } from '@/components/boards/BoardsList';
import { PostsList } from '@/components/posts/PostsList';
import { listBoardsForProject } from '@/server/repos/boards/boards';
import { listPosts } from '@/server/repos/posts/posts';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';

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

export default async function HomePage(props: {
  searchParams?: Promise<{ sort?: 'trending' | 'new' | 'top' }>;
}) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);

  // If no project found, this is the apex domain - show project selector
  if (!project) {
    return null;
  }

  const boards = await fetchBoards(project.id);
  const posts = await listPosts({ projectId: project.id });

  // Format the posts data to include createdAt as ISO string
  const formattedPosts = posts.items.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} />
        </div>
        <div className="col-span-12 md:col-span-8">
          <PostsList
            posts={formattedPosts}
            basePath=""
            boardSlug=""
            currentSort="trending"
            boardName="All Posts"
          />
        </div>
      </div>
    </main>
  );
}
