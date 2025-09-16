'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { getPostsWithVotesByOrgId } from '@/server/repo/post-repo';
import { VoteButton } from '../vote/vote-button';
import { PostStatusBadge } from './post-status-badge';

type PostWithVotes = Awaited<ReturnType<typeof getPostsWithVotesByOrgId>>[0];
type Board = Awaited<ReturnType<typeof getBoardsByOrgSlug>>[0];

export function PostsTableRow({
  post,
  orgSlug,
  boards,
}: {
  post: PostWithVotes;
  orgSlug: string;
  boards: Board[];
}) {
  return (
    <TableRow key={post.id} className="group">
      <TableCell className="align-center w-20">
        <VoteButton
          orgSlug={orgSlug}
          postId={post.id}
          initialVoted={post.hasVoted}
          initialCount={post.votesCount}
          size="sm"
        />
      </TableCell>

      <TableCell className="align-center pr-6 min-w-0">
        <div className="truncate font-medium">{post.title}</div>
      </TableCell>

      <TableCell className="align-center whitespace-nowrap text-muted-foreground text-xs w-22 hidden md:table-cell">
        {new Date(post.createdAt as unknown as string).toLocaleDateString()}
      </TableCell>

      <TableCell className="align-center whitespace-nowrap w-22 hidden md:table-cell">
        <PostStatusBadge status={post.status} />
      </TableCell>

      <TableCell className="align-center whitespace-nowrap w-36 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <span>{post.boardIcon}</span>
          <span className="truncate">{post.boardTitle}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
