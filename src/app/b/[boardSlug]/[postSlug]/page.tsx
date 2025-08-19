import { notFound } from "next/navigation";
import { getDatabase } from "@/server/db";
import { posts, boards } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "@/components/posts/VoteButton";
import { Comments } from "@/components/posts/Comments";

function statusInfo(status: string): { label: string; variant: "warning" | "secondary" | "success" | "destructive" | "outline" } {
  switch (status) {
    case "planned":
      return { label: "Planned", variant: "warning" };
    case "in_progress":
      return { label: "In Progress", variant: "secondary" };
    case "completed":
      return { label: "Completed", variant: "success" };
    case "closed":
      return { label: "Closed", variant: "destructive" };
    default:
      return { label: "Backlog", variant: "outline" };
  }
}

export default async function PostPage(props: { params: Promise<{ boardSlug: string; postSlug: string }> }) {
  const params = await props.params;
  const { db } = getDatabase();
  const [board] = await db.select({ id: boards.id, name: boards.name }).from(boards).where(eq(boards.slug, params.boardSlug)).limit(1);
  if (!board) return notFound();

  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      body: posts.body,
      status: posts.status,
      voteCount: posts.voteCount,
      commentCount: posts.commentCount,
      isArchived: posts.isArchived,
    })
    .from(posts)
    .where(and(eq(posts.boardId, board.id), eq(posts.slug, params.postSlug)))
    .limit(1);
  if (!post || post.isArchived) return notFound();

  const info = statusInfo(post.status);

  return (
    <main className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{board.name}</Badge>
            <Badge variant={info.variant}>{info.label}</Badge>
          </div>
          <VoteButton postId={post.id} initialCount={post.voteCount} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <article className="prose dark:prose-invert max-w-none whitespace-pre-wrap break-words">
              {post.body ?? ""}
            </article>
          </CardContent>
        </Card>
        <Comments postId={post.id} />
      </div>
    </main>
  );
}


