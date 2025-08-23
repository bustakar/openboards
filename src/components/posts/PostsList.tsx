'use client';
import { PostCard, type PostItem } from '@/components/posts/PostCard';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Button } from '../ui/button';

export type { PostItem } from '@/components/posts/PostCard';

type ItemWithBoard = PostItem & {
  board?: {
    id: string;
    name: string;
    slug: string;
  };
};

export function PostsList({
  posts,
  basePath,
  boardSlug,
  linkFor,
  currentSort,
  boardName,
}: {
  posts: ItemWithBoard[];
  basePath: string;
  boardSlug?: string;
  linkFor?: (p: ItemWithBoard) => string;
  currentSort?: 'trending' | 'new' | 'top';
  boardName?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNewPost = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('new', 'true');
    router.push(`?${params.toString()}`);
  };

  // Read sort from current URL and reflect in heading
  const heading =
    boardName ||
    (currentSort === 'new'
      ? 'New'
      : currentSort === 'top'
      ? 'Top'
      : 'Trending');
  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold">{heading}</h2>
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1">
              <Link
                href={`${basePath}?sort=trending`}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  currentSort === 'trending'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Top
              </Link>
              <Link
                href={`${basePath}?sort=new`}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  currentSort === 'new'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                New
              </Link>
              <Link
                href={`${basePath}?sort=top`}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  currentSort === 'top'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-900 hover:text-gray-900'
                }`}
              >
                Trending
              </Link>
            </div>
          </div>
          <Button onClick={handleNewPost} size="sm">
            New post
          </Button>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        {posts.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No posts yet.
          </div>
        ) : (
          posts.map((p) => {
            const href = linkFor
              ? linkFor(p)
              : `?post=${p.id}`;
            return <PostCard key={p.id} post={p} href={href} />;
          })
        )}
      </div>
    </div>
  );
}
