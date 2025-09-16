import { PublicBoardsList } from '@/components/public/public-boards-list';
import { PublicPostsList } from '@/components/public/public-posts-list';
import { PostStatus } from '@/db/schema';
import {
  PostsListOptions,
  PostsListSort,
} from '@/server/repo/public-post-repo';

export default async function PublicFeedbackPage({
  params,
  searchParams,
}: {
  params: { org: string };
  searchParams?: {
    board?: string;
    statuses?: string;
    search?: string;
    sort?: string;
  };
}) {
  const { org } = await params;
  const sp = await searchParams;

  const options: PostsListOptions = {
    statuses: (sp?.statuses || '').split(',').filter(Boolean) as PostStatus[],
    boardId: sp?.board || undefined,
    search: sp?.search || '',
    sort: (sp?.sort as PostsListSort) || 'new',
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex md:flex-row flex-col gap-6">
        <div className="min-w-64">
          <PublicBoardsList orgSlug={org} selectedBoardId={options.boardId} />
        </div>
        <div className="w-full">
          <PublicPostsList orgSlug={org} options={options} />
        </div>
      </div>
    </div>
  );
}
