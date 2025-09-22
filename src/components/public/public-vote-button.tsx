'use client';

import { Button } from '@/components/ui/button';
import {
  publicAddVoteAction,
  publicRemoveVoteAction,
} from '@/server/service/public-vote-service';
import { ThumbsUp } from 'lucide-react';
import { useState, useTransition } from 'react';

export function PublicVoteButton({
  orgSlug,
  postId,
  initialVoted,
  initialCount,
}: {
  orgSlug: string;
  postId: string;
  initialVoted: boolean;
  initialCount: number;
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const prev = voted;
      setVoted(!prev);
      setCount((c) => (prev ? Math.max(0, c - 1) : c + 1));
      try {
        const res = prev
          ? await publicRemoveVoteAction({ orgSlug, postId })
          : await publicAddVoteAction({ orgSlug, postId });
        setCount(res.count);
      } catch {
        setVoted(prev);
      }
    });
  };

  return (
    <Button
      variant={voted ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={isPending}
      className="gap-2"
      aria-pressed={voted}
    >
      <ThumbsUp className="size-4" />
      {count}
    </Button>
  );
}
