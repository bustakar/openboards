'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { getPostsWithVotesByOrgId } from '@/server/repo/post-repo';
import { updatePostAction } from '@/server/service/post-service';
import { useState, useTransition } from 'react';
import { VoteButton } from '../vote/vote-button';
import { PostDeleteButton } from './post-delete-button';
import { PostEditButton } from './post-edit-button';
import {
  ALL_POST_STATUSES,
  POST_STATUS_LABELS,
  PostStatusBadge,
} from './post-status-badge';

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
  const [status, setStatus] = useState(post.status);
  const [boardId, setBoardId] = useState(post.boardId || '');
  const [isCtxOpen, setIsCtxOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const currentBoard = boards.find((b) => b.id === boardId);

  const onChangeStatus = (s: typeof status) =>
    startTransition(async () => {
      setStatus(s);
      try {
        await updatePostAction({
          orgSlug,
          id: post.id,
          title: post.title,
          description: post.description,
          status: s,
          boardId: boardId,
        });
      } catch {
        setStatus(post.status);
      }
      setIsStatusOpen(false);
    });

  const onChangeBoard = (id: string) =>
    startTransition(async () => {
      setBoardId(id);
      try {
        await updatePostAction({
          orgSlug,
          id: post.id,
          title: post.title,
          description: post.description,
          status: post.status,
          boardId: id,
        });
      } catch {
        setBoardId(post.boardId || '');
      }
      setIsBoardOpen(false);
    });

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCtxOpen(true);
  };

  return (
    <DropdownMenu open={isCtxOpen} onOpenChange={setIsCtxOpen}>
      <DropdownMenuTrigger asChild>
        <div />
      </DropdownMenuTrigger>

      <TableRow key={post.id} className="group" onContextMenu={onContextMenu}>
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
          <DropdownMenu open={isStatusOpen} onOpenChange={setIsStatusOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center"
                aria-label="Change status"
                disabled={pending}
              >
                <PostStatusBadge status={status} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {ALL_POST_STATUSES.map((s) => (
                <DropdownMenuItem key={s} onClick={() => onChangeStatus(s)}>
                  {POST_STATUS_LABELS[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>

        <TableCell className="align-center whitespace-nowrap w-36 hidden md:table-cell">
          <DropdownMenu open={isBoardOpen} onOpenChange={setIsBoardOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2"
                aria-label="Move to board"
                disabled={pending}
              >
                <span>{currentBoard?.icon || post.boardIcon}</span>
                <span className="truncate">
                  {currentBoard?.title || post.boardTitle}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {boards.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => onChangeBoard(b.id)}
                >
                  <span className="mr-2">{b.icon}</span>
                  <span className="truncate">{b.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

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
            boardId: boardId || '',
          }}
        />
        <DropdownMenuSeparator />
        <PostDeleteButton
          orgSlug={orgSlug}
          postId={post.id}
          postTitle={post.title}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
