'use client';

import { Button } from '@/components/ui/button';
import {
  addVoteAction,
  getVoteCountAction,
  removeVoteAction,
} from '@/server/service/vote-service';
import { ThumbsUp } from 'lucide-react';
import { useState, useTransition } from 'react';

export function VoteButton({
  orgSlug,
  postId,
  initialVoted,
  initialCount,
  size = 'sm',
}: {
  orgSlug: string;
  postId: string;
  initialVoted: boolean;
  initialCount: number;
  size?: 'sm' | 'default';
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const prevVoted = voted;
      setVoted(!prevVoted);
      setCount((c) => (prevVoted ? Math.max(0, c - 1) : c + 1));
      try {
        if (prevVoted) {
          const { count } = await removeVoteAction({ orgSlug, postId });
          setCount(count);
        } else {
          const { count } = await addVoteAction({ orgSlug, postId });
          setCount(count);
        }
      } catch {
        setVoted(prevVoted);
        const { count } = await getVoteCountAction({ postId });
        setCount(count);
      }
    });
  };

  return (
    <Button
      variant={voted ? 'secondary' : 'outline'}
      size={size}
      onClick={onClick}
      disabled={isPending}
      className="gap-2"
      aria-pressed={voted}
      aria-label={voted ? 'Remove vote' : 'Add vote'}
    >
      <ThumbsUp className="size-4" />
      {count}
    </Button>
  );
}
