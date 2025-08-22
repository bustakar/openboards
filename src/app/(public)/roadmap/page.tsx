import { VoteButton } from '@/components/posts/VoteButton';
import { boards, posts } from '@/db/schema';
import { getDatabase } from '@/server/db';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects/projects';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type GroupKey = 'backlog' | 'planned' | 'in_progress' | 'completed';

function statusMeta(status: GroupKey): { label: string } {
  switch (status) {
    case 'planned':
      return { label: 'Next up' };
    case 'in_progress':
      return { label: 'In Progress' };
    case 'completed':
      return { label: 'Done' };
    default:
      return { label: 'Backlog' };
  }
}

export default async function RoadmapPage() {
  const headersList = await headers();
  const project = await getCurrentProjectFromHeaders(headersList);
  if (!project) return notFound();

  const { db } = getDatabase();

  const where = and(
    eq(posts.isArchived, false),
    inArray(posts.status, [
      'backlog',
      'planned',
      'in_progress',
      'completed',
    ] as const)
  );

  const items = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      voteCount: posts.voteCount,
      commentCount: posts.commentCount,
      pinned: posts.pinned,
      lastActivityAt: posts.lastActivityAt,
      boardSlug: boards.slug,
    })
    .from(posts)
    .leftJoin(boards, eq(posts.boardId, boards.id))
    .where(and(where, eq(posts.projectId, project.id)))
    .orderBy(
      desc(posts.pinned),
      desc(posts.voteCount),
      desc(posts.lastActivityAt)
    );

  const grouped: Record<GroupKey, typeof items> = {
    backlog: [],
    planned: [],
    in_progress: [],
    completed: [],
  } as Record<GroupKey, typeof items>;

  for (const it of items) {
    if (it.status === 'closed') continue;
    grouped[it.status as GroupKey].push(it);
  }

  const columns: GroupKey[] = [
    'backlog',
    'planned',
    'in_progress',
    'completed',
  ];

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Roadmap</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {columns.map((status) => {
          const meta = statusMeta(status);
          const list = grouped[status] ?? [];
          return (
            <section
              key={status}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col"
            >
              <header className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{list.length}</span>
              </header>
              <div className="space-y-2">
                {list.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center bg-white border border-gray-200 rounded-md">
                    No items
                  </div>
                ) : (
                  list.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={
                              p.boardSlug ? `/b/${p.boardSlug}/${p.slug}` : '#'
                            }
                            className="font-medium text-sm hover:underline line-clamp-2"
                          >
                            {p.title}
                          </Link>
                          <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                              <span>💬</span>
                              <span>{p.commentCount}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <VoteButton
                            postId={p.id}
                            initialCount={p.voteCount}
                            className="flex flex-col items-center gap-0.5 text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
