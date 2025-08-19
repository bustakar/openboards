import { BoardsList, type BoardItem } from "@/components/boards/BoardsList";

async function fetchBoards(): Promise<BoardItem[]> {
  // Prefer SSR: fetch from API route which will be wired later; fallback to empty
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/boards`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ id: string; name: string; slug: string; description?: string | null; posts?: number }>;
    return data.map((b) => ({ id: b.id, name: b.name, slug: b.slug, description: b.description ?? null, posts: b.posts }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const boards = await fetchBoards();
  return (
    <main className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <BoardsList boards={boards} />
        </div>
        <div className="col-span-12 md:col-span-8">
          {/* Placeholder for posts list (will implement in feature/posts-list) */}
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">Posts will appear here.</div>
        </div>
      </div>
    </main>
  );
}
