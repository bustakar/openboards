import { notFound } from "next/navigation";
import { getBoardBySlug } from "@/server/repos/boards";
import { listPosts, type PostStatus, type PostSort } from "@/server/repos/posts";
import { PostsList } from "@/components/posts/PostsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BoardPage(props: { params: Promise<{ boardSlug: string }>; searchParams?: Promise<{ status?: PostStatus; sort?: PostSort; q?: string }> }) {
  const params = await props.params;
  const sp = (await props.searchParams) ?? {};
  const board = await getBoardBySlug(params.boardSlug);
  if (!board) return notFound();

  const page = 1;
  const limit = 20;
  const data = await listPosts({ boardId: board.id, status: sp.status, sort: sp.sort ?? "trending", query: sp.q, page, limit });

  return (
    <main className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{board.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{board.description ?? ""}</p>
          </CardContent>
        </Card>
        <PostsList posts={data.items} boardSlug={board.slug} />
      </div>
    </main>
  );
}


