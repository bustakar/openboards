'use client';
import { Button } from '@/components/ui/button';
import { useVote } from '@/hooks/useVote';
import * as React from 'react';

export function VoteButton({
  postId,
  initialCount,
  className,
}: {
  postId: string;
  initialCount: number;
  className?: string;
}) {
  const { count, voted, loading, toggle } = useVote(postId, initialCount);

  return (
    <Button
      variant="outline"
      onClick={toggle}
      disabled={loading}
      aria-pressed={voted}
      className={`${className} ${
        voted
          ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
          : 'border-gray-300 hover:bg-gray-100'
      }`}
      aria-label={voted ? 'Remove vote' : 'Add vote'}
    >
      ▲ {count}
    </Button>
  );
}
