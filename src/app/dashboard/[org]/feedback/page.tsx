import { BoardsList } from '@/components/board/boards-list';
import { PostsTable } from '@/components/post/posts-table';
import { Separator } from '@/components/ui/separator';
import { PostStatus } from '@/db/schema';
import { OrgSlugSchema } from '@/server/lib/params';
import { z } from 'zod';

const QuerySchema = z.object({
  board: z.string().min(1).optional(),
  statuses: z
    .string()
    .transform((v) => (v ? v.split(',').filter(Boolean) : []))
    .optional(),
});

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: { org: string };
  searchParams?: { board?: string; statuses?: string };
}) {
  const { org } = OrgSlugSchema.parse(params);
  const qp = QuerySchema.parse(searchParams ?? {});
  const statusesArray = (qp.statuses as PostStatus[] | undefined) ?? [];

  return (
    <div className="p-6">
      <div className="flex md:flex-row flex-col gap-4">
        <div className="w-full md:w-96">
          <BoardsList orgSlug={org} selectedBoardId={qp.board} />
        </div>
        <Separator orientation="vertical" className="h-full" />
        <div className="w-full">
          <PostsTable
            orgSlug={org}
            filters={{ selectedBoardId: qp.board, statuses: statusesArray }}
          />
        </div>
      </div>
    </div>
  );
}
