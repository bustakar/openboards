import { Button } from '@/components/ui/button';
import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

export async function PublicBoardsList({
  orgSlug,
  selectedBoardId,
}: {
  orgSlug: string;
  selectedBoardId?: string;
}) {
  const boards = await getBoardsByOrgSlug(orgSlug);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Boards</h2>
      </div>
      <nav className="flex flex-col gap-1">
        <Link href={`/${orgSlug}/feedback`}>
          <Button
            variant={selectedBoardId ? 'ghost' : 'secondary'}
            size="lg"
            className="justify-start w-full"
          >
            <ClipboardList />
            All posts
          </Button>
        </Link>
        {boards.map((b) => (
          <Link key={b.id} href={`/${orgSlug}/feedback?board=${b.id}`}>
            <Button
              variant={selectedBoardId === b.id ? 'secondary' : 'ghost'}
              size="lg"
              className="justify-start w-full"
            >
              <span className="text-base">{b.icon}</span>
              <span className="truncate w-full text-left">{b.title}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}
