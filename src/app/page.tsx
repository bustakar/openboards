// Home page lists boards from the database when available
import { listBoardsWithStats } from "@/server/repos/boards";

export default async function Home() {
  let data: Awaited<ReturnType<typeof listBoardsWithStats>> = [];
  try {
    data = await listBoardsWithStats();
  } catch {
    // ignore if DB not configured yet
  }
  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold mb-6">Boards</h1>
      {data.length === 0 ? (
        <p className="text-sm opacity-70">No boards yet. Configure DATABASE_URL and run migrations.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((b) => (
            <li key={b.id} className="rounded border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.name}</div>
                  {b.description && <div className="text-sm opacity-70">{b.description}</div>}
                </div>
                <div className="text-sm opacity-70">{b.posts} posts</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
