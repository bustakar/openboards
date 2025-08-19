"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

export function VoteButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const storageKey = `voted:${postId}`;
  const [count, setCount] = React.useState(initialCount);
  const [voted, setVoted] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setVoted(raw === "true");
    } catch {}
  }, [storageKey]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/vote`, { method: "POST" });
      if (!res.ok) return;
      const data = (await res.json()) as { voted: boolean; voteCount: number };
      setVoted(data.voted);
      setCount(data.voteCount);
      try {
        localStorage.setItem(storageKey, String(data.voted));
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={voted ? "secondary" : "outline"} onClick={toggle} disabled={loading} aria-pressed={voted}>
      ▲ {count}
    </Button>
  );
}


