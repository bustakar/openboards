import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { ClipboardList, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { BoardAddButton } from './board-add-button';
import { BoardDeleteButton } from './board-delete-button';
import { BoardEditButton } from './board-edit-button';

export async function BoardsList({
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
        <BoardAddButton orgSlug={orgSlug} />
      </div>
      <nav className="flex flex-col gap-1">
        <Link asChild href={`/dashboard/${orgSlug}/feedback`}>
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
          <Link
            asChild
            key={b.id}
            href={`/dashboard/${orgSlug}/feedback?board=${b.id}`}
            className="group"
          >
            <Button
              variant={selectedBoardId === b.id ? 'secondary' : 'ghost'}
              size="lg"
              className="justify-start w-full"
            >
              <span className="text-base">{b.icon}</span>
              <span className="truncate w-full text-left">{b.title}</span>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <BoardEditButton
                      orgSlug={orgSlug}
                      board={{ id: b.id, title: b.title, icon: b.icon }}
                    />
                    <BoardDeleteButton
                      orgSlug={orgSlug}
                      boardId={b.id}
                      boardTitle={b.title}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}
