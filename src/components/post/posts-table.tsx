import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { PostStatus } from '@/db/schema';
import { auth } from '@/server/auth';
import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import {
  getPostsWithVotesByBoardId,
  getPostsWithVotesByOrgId,
} from '@/server/repo/post-repo';
import { headers } from 'next/headers';
import { PostAddButton } from './post-add-button';
import { PostsListFilterButton } from './posts-list-filter-button';
import { PostsTableFilterButton } from './posts-table-filter-button';
import { PostsTableRow } from './posts-table-row';

export type PostsTableFilters = {
  selectedBoardId?: string;
  statuses?: PostStatus[];
};

export async function PostsTable({
  orgSlug,
  filters,
}: {
  orgSlug: string;
  filters: PostsTableFilters;
}) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  const userId = session?.user?.id;

  const org = await getOrganizationBySlug(orgSlug);
  if (!org) return null;

  const [boards, posts] = await Promise.all([
    getBoardsByOrgSlug(orgSlug),
    filters.selectedBoardId
      ? getPostsWithVotesByBoardId(
          org.id,
          filters.selectedBoardId,
          userId,
          filters.statuses
        )
      : getPostsWithVotesByOrgId(org.id, userId, filters.statuses),
  ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Posts</h2>
        <div className="flex items-center gap-2">
          <PostsListFilterButton />
          <PostAddButton
            orgSlug={orgSlug}
            boards={boards.map((b) => ({
              id: b.id,
              title: b.title,
              icon: b.icon,
            }))}
          />
        </div>
      </div>

      <Table>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
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
