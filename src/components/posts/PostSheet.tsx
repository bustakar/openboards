'use client';
import { CommentsClient } from '@/components/posts/CommentsClient';
import { VoteButton } from '@/components/posts/VoteButton';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Post = {
  id: string;
  title: string;
  body?: string | null;
  status: 'backlog' | 'planned' | 'in_progress' | 'completed' | 'closed';
  voteCount: number;
  commentCount: number;
  createdAt: string;
  board: {
    id: string;
    name: string;
    slug: string;
  };
};

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

export function PostSheet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);

  // Check if sheet should be open based on URL
  useEffect(() => {
    const postId = searchParams.get('post');
    setOpen(!!postId);
    
    if (postId) {
      fetchPost(postId);
    }
  }, [searchParams]);

  // Handle sheet close - remove the search param
  const handleClose = () => {
    setOpen(false);
    setPost(null);
    // Remove the search param to close the sheet
    const params = new URLSearchParams(searchParams.toString());
    params.delete('post');
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(newUrl, { scroll: false });
  };

  async function fetchPost(postId: string) {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) {
        setError('Post not found');
        return;
      }
      
      const postData = await res.json();
      setPost(postData);
    } catch (error) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  }

  if (!post && !loading) return null;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            {loading ? 'Loading...' : post?.title}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 px-6 pb-6">
          {loading ? (
            <div className="text-center py-8">Loading post...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : post ? (
            <div className="space-y-6">
              {/* Post header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-xl font-bold text-gray-900">
                      {post.title}
                    </h1>
                    <Badge variant={statusInfo(post.status).variant} className="text-xs px-2 py-1">
                      {statusInfo(post.status).label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>💡</span>
                    <span>Feature Request</span>
                    <span>•</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{post.commentCount}</span>
                    </div>
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
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <article className="prose prose-gray max-w-none whitespace-pre-wrap break-words text-sm">
                    {post.body}
                  </article>
                </div>
              )}

              {/* Comments */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Comments</h3>
                <CommentsClient postId={post.id} />
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
