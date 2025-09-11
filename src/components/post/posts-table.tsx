import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import { getPostsByBoardId, getPostsByOrgId } from '@/server/repo/post-repo';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { PostAddButton } from './post-add-button';
import { PostDeleteButton } from './post-delete-button';
import { PostEditButton } from './post-edit-button';

export async function PostsTable({
  orgSlug,
  selectedBoardId,
}: {
  orgSlug: string;
  selectedBoardId?: string;
}) {
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) return null;

  const [boards, posts] = await Promise.all([
    getBoardsByOrgSlug(orgSlug),
    selectedBoardId
      ? getPostsByBoardId(org.id, selectedBoardId)
      : getPostsByOrgId(org.id),
  ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Posts</h2>
        <PostAddButton
          orgSlug={orgSlug}
          boards={boards.map((b) => ({
            id: b.id,
            title: b.title,
            icon: b.icon,
          }))}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Title</TableHead>
            <TableHead>Board</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No posts yet.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((p) => (
              <TableRow key={p.id} className="group">
                <TableCell className="pr-6">
                  <div className="truncate">{p.title}</div>
                  <div className="text-muted-foreground line-clamp-1 text-xs">
                    {p.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{p.boardIcon}</span>
                    <span className="truncate">{p.boardTitle}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(
                    p.createdAt as unknown as string
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
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
                        <PostEditButton
                          orgSlug={orgSlug}
                          boards={boards.map((b) => ({
                            id: b.id,
                            title: b.title,
                            icon: b.icon,
                          }))}
                          post={{
                            id: p.id,
                            title: p.title,
                            description: p.description,
                            boardId: p.boardId!,
                          }}
                        />
                        <PostDeleteButton
                          orgSlug={orgSlug}
                          postId={p.id}
                          postTitle={p.title}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
