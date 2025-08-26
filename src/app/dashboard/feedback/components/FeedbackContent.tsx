'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconMessageCircle, IconPlus, IconSearch } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Board {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  voteCount: number;
  commentCount: number;
  createdAt: string;
  boardName: string;
}

export function FeedbackContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      const url = projectId
        ? `/api/boards?project=${projectId}`
        : '/api/boards';
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in again.');
          return;
        }
        throw new Error(`Failed to fetch boards: ${response.status}`);
      }
      const data = await response.json();
      setBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      setError('Failed to load boards. Please try again.');
    }
  }, [projectId]);

  const fetchPosts = useCallback(
    async (boardId?: string) => {
      try {
        setLoading(true);
        setError(null);
        let url = '/api/posts';
        const params = new URLSearchParams();
        if (projectId) params.append('project', projectId);
        if (boardId) params.append('boardId', boardId);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required. Please log in again.');
            return;
          }
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data.items || data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    if (projectId) {
      fetchBoards();
      fetchPosts();
    }
  }, [projectId, fetchBoards, fetchPosts]);

  const handleBoardSelect = (boardId: string | null) => {
    setSelectedBoard(boardId);
    fetchPosts(boardId || undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500';
      case 'planned':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (error) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r bg-gray-50/50">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Boards</h2>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar - Boards List */}
      <div className="w-80 border-r bg-gray-50/50 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Boards</h2>

          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-2">
              {/* All Posts Button */}
              <button
                onClick={() => handleBoardSelect(null)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedBoard === null
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">All Posts</div>
                <div className="text-sm text-gray-500">
                  {posts.length} posts
                </div>
              </button>

              {/* Boards List */}
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => handleBoardSelect(board.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedBoard === board.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{board.name}</div>
                  <div className="text-sm text-gray-500">
                    {board.postCount} posts
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Right Main Content - Posts Table */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Posts ({posts.length})</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <IconPlus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search posts..." className="pl-10" />
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="flex-1 overflow-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">No posts found</div>
            </div>
          ) : (
            <Table className="w-full min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Votes</TableHead>
                  <TableHead className="flex-1">Title</TableHead>
                  <TableHead className="w-20">Date</TableHead>
                  <TableHead className="w-24">Board</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-16">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow
                    key={post.id}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-600">
                        <IconMessageCircle className="w-4 h-4" />
                        <span className="font-medium">{post.voteCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {post.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(post.createdAt)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {post.boardName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-white ${getStatusColor(post.status)}`}
                      >
                        {post.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {post.commentCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
