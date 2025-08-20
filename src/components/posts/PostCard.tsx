import { VoteButton } from '@/components/posts/VoteButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import * as React from 'react';

export type PostItem = {
  id: string;
  title: string;
  slug: string;
  status: 'backlog' | 'planned' | 'in_progress' | 'completed' | 'closed';
  voteCount: number;
  commentCount: number;
};

function statusVariant(status: PostItem['status']) {
  switch (status) {
    case 'planned':
      return { label: 'Planned', variant: 'warning' as const };
    case 'in_progress':
      return { label: 'In Progress', variant: 'secondary' as const };
    case 'completed':
      return { label: 'Completed', variant: 'success' as const };
    case 'closed':
      return { label: 'Closed', variant: 'destructive' as const };
    default:
      return { label: 'Backlog', variant: 'outline' as const };
  }
}

export function PostCard({ post, href }: { post: PostItem; href?: string }) {
  const st = statusVariant(post.status);
  return (
    <Card className="hover:bg-muted/60 transition-colors">
      <CardContent className="p-4 flex items-start gap-4">
        <VoteButton
          postId={post.id}
          initialCount={post.voteCount}
          className="w-14 justify-center"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant={st.variant}>{st.label}</Badge>
          </div>
          {href ? (
            <Link
              href={href}
              className="font-medium mt-1 line-clamp-2 hover:underline"
            >
              {post.title}
            </Link>
          ) : (
            <div className="font-medium mt-1 line-clamp-2">{post.title}</div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            {post.commentCount} comments
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
