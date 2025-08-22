'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Board = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export function FormClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');

  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const data = await res.json();
          setBoards(data);
          if (data.length > 0) {
            setSelectedBoardId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      }
    }
    fetchBoards();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || !selectedBoardId) return;
    
    setLoading(true);
    setError(null);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      boardId: selectedBoardId,
      title: String(formData.get('title') || '').trim(),
      body: String(formData.get('body') || '').trim(),
    };
    
    if (!payload.title) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error === 'validation_error' ? 'Please check your input' : 'Failed to submit. Please try again.');
        setLoading(false);
        return;
      }
      
      const created = await res.json();
      const selectedBoard = boards.find(b => b.id === selectedBoardId);
      if (selectedBoard) {
        router.push(`/b/${selectedBoard.slug}/${created.slug}`);
      }
    } catch {
      setError('Failed to submit. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Board</label>
        <select
          value={selectedBoardId}
          onChange={(e) => setSelectedBoardId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>
        {selectedBoardId && (
          <div className="text-xs text-muted-foreground mt-1">
            {boards.find(b => b.id === selectedBoardId)?.description}
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          name="title"
          placeholder="Short, descriptive title"
          required
          maxLength={120}
        />
        <div className="text-xs text-muted-foreground mt-1">
          Up to 120 characters
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Details (optional)
        </label>
        <Textarea
          name="body"
          placeholder="Describe your request or report"
          maxLength={10000}
        />
      </div>
      
      {error && <div className="text-sm text-red-600">{error}</div>}
      
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading || !selectedBoardId}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
