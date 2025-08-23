import { CommentsClient } from '@/components/posts/CommentsClient';
import { VoteButton } from '@/components/posts/VoteButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBoardBySlug } from '@/server/repos/boards/boards';
import { getPostBySlug } from '@/server/repos/posts/posts';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

function statusInfo(status: string): {
  label: string;
  variant: 'secondary' | 'default' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'planned':
      return { label: 'Planned', variant: 'secondary' };
    case 'in_progress':
      return { label: 'In Progress', variant: 'default' };
    case 'completed':
      return { label: 'Completed', variant: 'secondary' };
    case 'closed':
      return { label: 'Closed', variant: 'destructive' };
    default:
      return { label: 'Backlog', variant: 'outline' };
  }
}

export default async function PostPage(props: {
  params: Promise<{ boardSlug: string; postSlug: string }>;
}) {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);
  if (!project) return notFound();
  const params = await props.params;
  const board = await getBoardBySlug(params.boardSlug);
  if (!board) return notFound();
  const post = await getPostBySlug(board.id, params.postSlug);
  if (!post) return notFound();

  const info = statusInfo(post.status);

  return (
    <main className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              All posts
            </Link>
            <span>/</span>
            <Link
              href={`/b/${params.boardSlug}`}
              className="hover:text-gray-900"
            >
              {board.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{post.title}</span>
          </nav>
        </div>

        {/* Post header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {post.title}
                </h1>
                <Badge variant={info.variant} className="text-xs px-2 py-1">
                  {info.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>💡</span>
                <span>Feature Request</span>
                <span>•</span>
                <span>💬 {post.commentCount} comments</span>
              </div>
            </div>
            <VoteButton
              postId={post.id}
              initialCount={post.voteCount}
              className="flex flex-col items-center gap-1 text-lg font-semibold"
            />
          </div>

          {/* Post body */}
          {post.body && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <article className="prose prose-gray max-w-none whitespace-pre-wrap break-words">
                {post.body}
              </article>
            </div>
          )}
        </div>

        {/* Comments */}
        <CommentsClient postId={post.id} />
      </div>
    </main>
  );
}
