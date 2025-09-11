'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { getPostsWithVotesByOrgId } from '@/server/repo/post-repo';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { VoteButton } from '../vote/vote-button';
import { PostDeleteButton } from './post-delete-button';
import { PostEditButton } from './post-edit-button';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <TableRow
      key={post.id}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TableCell>
        <VoteButton
          orgSlug={orgSlug}
          postId={post.id}
          initialVoted={post.hasVoted}
          initialCount={post.votesCount}
          size="sm"
        />
      </TableCell>
      <TableCell className="pr-6">
        <div className="truncate">{post.title}</div>
        <div className="text-muted-foreground line-clamp-1 text-xs">
          {post.description}
        </div>
      </TableCell>
      <TableCell>
        <PostStatusBadge status={post.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{post.boardIcon}</span>
          <span className="truncate">{post.boardTitle}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {new Date(post.createdAt as unknown as string).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div
          className={`transition-opacity ${isHovered || isDropdownOpen ? 'opacity-100' : 'opacity-0'}`}
        >
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More options">
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
                  id: post.id,
                  title: post.title,
                  description: post.description,
                  boardId: post.boardId || '',
                }}
              />
              <PostDeleteButton
                orgSlug={orgSlug}
                postId={post.id}
                postTitle={post.title}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
