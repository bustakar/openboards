import { BoardsList } from '@/components/board/boards-list';
import { Separator } from '@/components/ui/separator';

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: { org: string };
  searchParams?: { board?: string };
}) {
  const { org } = await params;
  const { board } = await searchParams;

  return (
    <div className="p-6">
      <div className="flex flex-col">
        <div className="w-96">
          <BoardsList orgSlug={org} selectedBoardId={board} />
        </div>
        <Separator orientation="vertical" className="h-full" />
        <div className="flew-grow h-full"></div>
      </div>
    </div>
  );
}
