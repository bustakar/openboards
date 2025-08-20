import { PostCard, type PostItem } from '@/components/posts/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import * as React from 'react';
export type { PostItem } from '@/components/posts/PostCard';

export function PostsList({ posts, boardSlug }: { posts: PostItem[]; boardSlug: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trending</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/b/${boardSlug}?sort=trending`} className="hover:underline">Top</Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/b/${boardSlug}?sort=new`} className="hover:underline">New</Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/b/${boardSlug}?sort=top`} className="hover:underline">Trending</Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-sm text-muted-foreground">No posts yet.</div>
        ) : (
          posts.map((p) => (
            <PostCard key={p.id} post={p} href={`/b/${boardSlug}/${p.slug}`} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
