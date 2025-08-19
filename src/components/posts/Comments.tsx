import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as React from 'react';
import { listComments } from '@/server/repos/comments';

export type CommentItem = {
  id: string;
  body: string;
  authorName: string | null;
  createdAt: string;
};

export async function Comments({ postId }: { postId: string }) {
  const rows = await listComments(postId);
  const items: CommentItem[] = rows.map((r) => ({
    id: r.id,
    body: r.body,
    authorName: r.authorName,
    createdAt: String(r.createdAt),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No comments yet.</div>
        ) : (
          <ul className="space-y-3">
            {items.map((c) => (
              <li key={c.id} className="rounded border p-3">
                <div className="text-sm whitespace-pre-wrap break-words">
                  {c.body}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.authorName ?? 'Anonymous'} •{' '}
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
        <CommentForm postId={postId} />
      </CardContent>
    </Card>
  );
}

function CommentForm({ postId }: { postId: string }) {
  async function action(formData: FormData) {
    'use server';
    const body = String(formData.get('body') || '').trim();
    const authorName =
      String(formData.get('authorName') || '').trim() || undefined;
    if (!body) return;
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/posts/${postId}/comments`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body, authorName }),
      }
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Comment</label>
        <Textarea
          name="body"
          placeholder="Share your thoughts"
          required
          maxLength={10000}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Name (optional)
        </label>
        <Input name="authorName" placeholder="Your name" maxLength={60} />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Add comment</Button>
      </div>
    </form>
  );
}
