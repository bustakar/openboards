import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { auth } from '@/server/auth';
import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import {
  getPostsWithVotesByBoardId,
  getPostsWithVotesByOrgId,
} from '@/server/repo/post-repo';
import { headers } from 'next/headers';
import { PostAddButton } from './post-add-button';
import { PostsTableRow } from './posts-table-row';

export async function PostsTable({
  orgSlug,
  selectedBoardId,
}: {
  orgSlug: string;
  selectedBoardId?: string;
}) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  const userId = session?.user?.id;

  const org = await getOrganizationBySlug(orgSlug);
  if (!org) return null;

  const [boards, posts] = await Promise.all([
    getBoardsByOrgSlug(orgSlug),
    selectedBoardId
      ? getPostsWithVotesByBoardId(org.id, selectedBoardId, userId)
      : getPostsWithVotesByOrgId(org.id, userId),
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
            <TableHead className="w-24">Votes</TableHead>
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
              <PostsTableRow
                key={p.id}
                post={p}
                orgSlug={orgSlug}
                boards={boards}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
