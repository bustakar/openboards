import { PostCard, type PostItem } from '@/components/posts/PostCard';
import Link from 'next/link';
import * as React from 'react';
export type { PostItem } from '@/components/posts/PostCard';

type ItemWithBoard = PostItem & { boardSlug?: string };

export function PostsList({
  posts,
  basePath,
  boardSlug,
  linkFor,
  currentSort,
}: {
  posts: ItemWithBoard[];
  basePath: string;
  boardSlug?: string;
  linkFor?: (p: ItemWithBoard) => string;
  currentSort?: 'trending' | 'new' | 'top';
}) {
  // Read sort from current URL and reflect in heading
  const heading =
    currentSort === 'new' ? 'New' : currentSort === 'top' ? 'Top' : 'Trending';
  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{heading}</h2>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`${basePath}?sort=trending`}
              className="hover:underline px-3 py-1 rounded-md hover:bg-muted/50 transition-colors"
            >
              Top
            </Link>
            <Link 
              href={`${basePath}?sort=new`} 
              className="hover:underline px-3 py-1 rounded-md hover:bg-muted/50 transition-colors"
            >
              New
            </Link>
            <Link 
              href={`${basePath}?sort=top`} 
              className="hover:underline px-3 py-1 rounded-md hover:bg-muted/50 transition-colors"
            >
              Trending
            </Link>
          </div>
        </div>
      </div>
      <div>
        {posts.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No posts yet.
          </div>
        ) : (
          posts.map((p) => {
            const href = linkFor
              ? linkFor(p)
              : boardSlug
              ? `/b/${boardSlug}/${p.slug}`
              : p.boardSlug
              ? `/b/${p.boardSlug}/${p.slug}`
              : undefined;
            return <PostCard key={p.id} post={p} href={href} />;
          })
        )}
      </div>
    </div>
  );
}
