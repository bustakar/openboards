import { BoardsList } from '@/components/board/boards-list';
import { PostsTable } from '@/components/post/posts-table';
import { Separator } from '@/components/ui/separator';
import { PostStatus } from '@/db/schema';

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: { org: string };
  searchParams?: { board?: string; statuses?: string };
}) {
  const { org } = await params;
  const resolvedSearchParams = await searchParams;
  const board = resolvedSearchParams?.board;
  const statuses = resolvedSearchParams?.statuses;
  const statusesArray = statuses ? (statuses.split(',') as PostStatus[]) : [];

  return (
    <div className="p-6">
      <div className="flex flex-row gap-4">
        <div className="w-96">
          <BoardsList orgSlug={org} selectedBoardId={board} />
        </div>
        <Separator orientation="vertical" className="h-full" />
        <div className="w-full">
          <PostsTable
            orgSlug={org}
            filters={{ selectedBoardId: board, statuses: statusesArray }}
          />
        </div>
      </div>
    </div>
  );
}
