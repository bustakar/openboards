import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard, type PostItem } from "@/components/posts/PostCard";
export type { PostItem } from "@/components/posts/PostCard";

export function PostsList({ posts }: { posts: PostItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Trending</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-sm text-muted-foreground">No posts yet.</div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </CardContent>
    </Card>
  );
}


