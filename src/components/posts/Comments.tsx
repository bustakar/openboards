import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { listComments } from '@/server/repos/comments';
import * as React from 'react';

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
    <div className="space-y-6">
      {/* Comments header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Comments ({items.length})
        </h2>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-sm text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="text-sm text-gray-900 whitespace-pre-wrap break-words mb-2">
                  {c.body}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">
                    {c.authorName ?? 'Anonymous'}
                  </span>
                  {' • '}
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add a comment
        </h3>
        <CommentForm postId={postId} />
      </div>
    </div>
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
    // Best-effort revalidation for pages under /b
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/b');
    } catch {}
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment
        </label>
        <Textarea
          name="body"
          placeholder="Share your thoughts..."
          required
          maxLength={10000}
          rows={4}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name (optional)
        </label>
        <Input
          name="authorName"
          placeholder="Your name"
          maxLength={60}
          className="w-full"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Add comment
        </Button>
      </div>
    </form>
  );
}
