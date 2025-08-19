"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function FormClient({ boardSlug }: { boardSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      body: String(formData.get("body") || "").trim(),
    };
    if (!payload.title) {
      setError("Title is required");
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/boards/${encodeURIComponent(boardSlug)}/posts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Failed to submit. Please try again.");
      setLoading(false);
      return;
    }
    const created = (await res.json()) as { slug: string };
    router.push(`/b/${boardSlug}/${created.slug}`);
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input name="title" placeholder="Short, descriptive title" required maxLength={120} />
        <div className="text-xs text-muted-foreground mt-1">Up to 120 characters</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Details (optional)</label>
        <Textarea name="body" placeholder="Describe your request or report" maxLength={10000} />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}


