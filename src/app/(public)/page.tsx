import { BoardsLayout } from '@/components/boards/BoardsLayout';
import { PostsList } from '@/components/posts/PostsList';
import { listPosts } from '@/server/repos/posts/posts';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function HomePage(props: {
  searchParams?: Promise<{ sort?: 'trending' | 'new' | 'top' }>;
}) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);

  // If no project found, return 404
  if (!project) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const sort = searchParams?.sort || 'trending';
  
  const posts = await listPosts({ 
    projectId: project.id,
    sort: sort as 'trending' | 'new' | 'top'
  });

  // Format the posts data to include createdAt as ISO string
  const formattedPosts = posts.items.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <BoardsLayout selectedSlug="">
      <PostsList
        posts={formattedPosts}
        basePath=""
        boardSlug=""
        currentSort={sort}
        boardName="All Posts"
      />
    </BoardsLayout>
  );
}
