'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

type Comment = {
  id: string;
  body: string;
  authorName?: string | null;
  createdAt: string;
};

export function CommentsClient({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = String(formData.get('body') || '').trim();
    const authorName = String(formData.get('authorName') || '').trim() || undefined;

    if (!body) {
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body, authorName }),
      });

      if (res.ok) {
        // Reset form
        e.currentTarget.reset();
        // Refresh comments
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-sm text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add comment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
