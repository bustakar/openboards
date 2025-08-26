'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const projectSlug = searchParams.get('project');
  const boardSlug = searchParams.get('board');

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/posts';
      const params = new URLSearchParams();
      if (projectSlug) params.append('project', projectSlug);
      if (boardSlug) params.append('boardSlug', boardSlug);
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
  }, [projectSlug, boardSlug]);

  useEffect(() => {
    if (projectSlug) {
      fetchPosts();
    }
  }, [projectSlug, boardSlug, fetchPosts]);

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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">
            Posts ({posts.length})
            {boardSlug && (
              <span className="text-lg font-normal text-gray-500 ml-2">
                - {boardSlug}
              </span>
            )}
          </h1>
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
  );
}
