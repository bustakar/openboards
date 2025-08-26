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
  const projectSlug = searchParams.get('project');
  const boardSlug = searchParams.get('board');
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!projectSlug) return;

      try {
        setLoading(true);

        // First, get the project by slug to get the project ID
        const projectResponse = await fetch(
          `/api/projects/public?subdomain=${projectSlug}`
        );
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();

          // Then fetch boards using the project ID
          const boardsResponse = await fetch(
            `/api/boards?project=${projectData.id}`
          );
          if (boardsResponse.ok) {
            const boardsData = await boardsResponse.json();
            setBoards(
              boardsData.map((b: Board) => ({
                id: b.id,
                name: b.name,
                slug: b.slug,
                description: b.description ?? null,
                postCount: b.postCount,
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectSlug]);

  if (!projectSlug) {
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
              href={`/dashboard/feedback?project=${projectSlug}`}
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
                  href={`/dashboard/feedback?project=${projectSlug}&board=${board.slug}`}
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
