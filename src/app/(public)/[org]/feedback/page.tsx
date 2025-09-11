import { PublicBoardsList } from '@/components/public/public-boards-list';
import { PublicPostsList } from '@/components/public/public-posts-list';

export default async function PublicFeedbackPage({
  params,
  searchParams,
}: {
  params: { org: string };
  searchParams?: { board?: string; statuses?: string };
}) {
  const { org } = await params;
  const resolvedSearchParams = await searchParams;
  const board = resolvedSearchParams?.board;
  const statuses = (resolvedSearchParams?.statuses || '')
    .split(',')
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex md:flex-row flex-col gap-6">
        <div className="min-w-64">
          <PublicBoardsList orgSlug={org} selectedBoardId={board} />
        </div>
        <div>
          <PublicPostsList orgSlug={org} boardId={board} statuses={statuses} />
        </div>
      </div>
    </div>
  );
}
