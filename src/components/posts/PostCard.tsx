import { VoteButton } from '@/components/posts/VoteButton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import * as React from 'react';

export type PostItem = {
  id: string;
  title: string;
  slug: string;
  status: 'backlog' | 'planned' | 'in_progress' | 'completed' | 'closed';
  voteCount: number;
  commentCount: number;
  createdAt: string;
};

function statusVariant(status: PostItem['status']) {
  switch (status) {
    case 'planned':
      return { label: 'Planned', variant: 'secondary' as const };
    case 'in_progress':
      return { label: 'In Progress', variant: 'default' as const };
    case 'completed':
      return { label: 'Completed', variant: 'secondary' as const };
    case 'closed':
      return { label: 'Closed', variant: 'destructive' as const };
    default:
      return { label: 'Backlog', variant: 'outline' as const };
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

export function PostCard({ post, href }: { post: PostItem; href?: string }) {
  const st = statusVariant(post.status);
  return (
    <div className="px-6 py-6 hover:bg-gray-100/50 transition-colors border-b border-gray-200/50 last:border-b-0 bg-white">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and status badge row */}
          <div className="flex items-center gap-3 mb-2">
            {href ? (
              <Link
                href={href}
                className="font-semibold text-base hover:underline line-clamp-2"
              >
                {post.title}
              </Link>
            ) : (
              <div className="font-semibold text-base line-clamp-2">
                {post.title}
              </div>
            )}
            <Badge
              variant={st.variant}
              className="text-xs px-2 py-1 flex-shrink-0"
            >
              {st.label}
            </Badge>
          </div>

          {/* Metadata line */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-amber-500">💡</span>
              <span>Feature Request</span>
            </div>
            <span>•</span>
            <span>{formatTimeAgo(post.createdAt)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>💬</span>
              <span>{post.commentCount}</span>
            </div>
          </div>
        </div>

        {/* Vote count on the right */}
        <div className="flex-shrink-0">
          <VoteButton
            postId={post.id}
            initialCount={post.voteCount}
            className="flex flex-col items-center gap-1 text-lg font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
