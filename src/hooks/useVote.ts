'use client';
import { useState } from 'react';

interface VoteState {
  count: number;
  voted: boolean;
  loading: boolean;
}

interface VoteResponse {
  voted: boolean;
  voteCount: number;
}

export function useVote(postId: string, initialCount: number) {
  const [state, setState] = useState<VoteState>({
    count: initialCount,
    voted: false, // We don't know if user voted initially, will be updated on first interaction
    loading: false,
  });

  const toggle = async () => {
    if (state.loading) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`/api/posts/${postId}/vote`, { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to toggle vote');
      }

      const data: VoteResponse = await res.json();
      setState((prev) => ({
        ...prev,
        voted: data.voted,
        count: data.voteCount,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to toggle vote:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    count: state.count,
    voted: state.voted,
    loading: state.loading,
    toggle,
  };
}
