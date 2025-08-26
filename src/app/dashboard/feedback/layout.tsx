'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Board {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

interface FeedbackLayoutProps {
  children: React.ReactNode;
}

export default function FeedbackLayout({ children }: FeedbackLayoutProps) {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const boardSlug = searchParams.get('board');
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBoards() {
      if (!projectId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/boards?project=${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setBoards(
            data.map((b: Board) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              description: b.description ?? null,
              postCount: b.postCount,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching boards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBoards();
  }, [projectId]);

  if (!projectId) {
    return <div>No project selected</div>;
  }

  const getBoardLinkClass = (isActive: boolean) => {
    return `block w-full text-left p-3 rounded-lg border transition-colors ${
      isActive
        ? 'bg-blue-50 border-blue-200 text-blue-700'
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`;
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar - Boards List */}
      <div className="w-80 border-r bg-gray-50/50 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Boards</h2>
          <div className="space-y-2">
            {/* All Posts Button */}
            <Link
              href={`/dashboard/feedback?project=${projectId}`}
              className={getBoardLinkClass(!boardSlug)}
            >
              <div className="font-medium">All Posts</div>
              <div className="text-sm text-gray-500">All posts</div>
            </Link>

            {/* Boards List */}
            {loading ? (
              <div className="text-sm text-gray-500">Loading boards...</div>
            ) : (
              boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/dashboard/feedback?project=${projectId}&board=${board.slug}`}
                  className={getBoardLinkClass(boardSlug === board.slug)}
                >
                  <div className="font-medium">{board.name}</div>
                  <div className="text-sm text-gray-500">
                    {board.postCount} posts
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col w-full">{children}</div>
    </div>
  );
}
