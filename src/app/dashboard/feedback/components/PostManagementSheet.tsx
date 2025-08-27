'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import {
  IconArchive,
  IconMessageCircle,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { useState } from 'react';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  isArchived: boolean;
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
  description?: string;
}

interface PostManagementSheetProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const POST_STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-green-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'planned', label: 'Planned', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-600' },
  { value: 'closed', label: 'Closed', color: 'bg-red-500' },
];

export function PostManagementSheet({
  post,
  isOpen,
  onClose,
  onUpdate,
}: PostManagementSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [editedPost, setEditedPost] = useState<Partial<Post>>({});

  // Load comments when post is opened
  const loadComments = async () => {
    if (!post) return;

    try {
      setIsLoadingComments(true);
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.items || data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!post) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setEditedPost({ ...editedPost, status: newStatus });
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating post status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchivePost = async () => {
    if (!post) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });

      if (response.ok) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error archiving post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/posts/${post?.id}/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isArchived: true }),
        }
      );

      if (response.ok) {
        setComments(
          comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, isArchived: true }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error archiving comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusConfig = POST_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || 'bg-gray-500';
  };

  const currentPost = { ...post, ...editedPost };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="min-w-[400px] sm:min-w-[600px] max-w-full overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Manage Post</SheetTitle>
          <SheetDescription>
            Edit post status, view comments, and manage post content.
          </SheetDescription>
        </SheetHeader>

        {currentPost && (
          <div className="mt-6 px-6 pb-6 space-y-6">
            {/* Post Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="block mb-2">
                  Title
                </Label>
                <Input
                  id="title"
                  value={currentPost.title || ''}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              {currentPost.description && (
                <div>
                  <Label htmlFor="description" className="block mb-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={currentPost.description}
                    readOnly
                    className="bg-gray-50"
                    rows={3}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="board" className="block mb-2">
                    Board
                  </Label>
                  <Input
                    id="board"
                    value={currentPost.boardName || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="created" className="block mb-2">
                    Created
                  </Label>
                  <Input
                    id="created"
                    value={formatDate(currentPost.createdAt || '')}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="votes" className="block mb-2">
                    Votes
                  </Label>
                  <Input
                    id="votes"
                    value={currentPost.voteCount || 0}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="comments" className="block mb-2">
                    Comments
                  </Label>
                  <Input
                    id="comments"
                    value={currentPost.commentCount || 0}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Status Management */}
            <div className="space-y-4">
              <div className="flex flex-row gap-2 justify-between items-center">
                <Label htmlFor="status" className="block mb-2">
                  Status
                </Label>
                <Select
                  value={currentPost.status}
                  onValueChange={handleStatusChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${status.color}`}
                          />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="destructive"
                onClick={handleArchivePost}
                disabled={isLoading}
                className="w-full"
              >
                <IconArchive className="w-4 h-4 mr-2" />
                Archive Post
              </Button>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Comments</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadComments}
                  disabled={isLoadingComments}
                >
                  <IconMessageCircle className="w-4 h-4 mr-2" />
                  {isLoadingComments ? 'Loading...' : 'Load Comments'}
                </Button>
              </div>

              {comments.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 border rounded-lg ${
                        comment.isArchived
                          ? 'bg-gray-50 opacity-60'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <IconUser className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">
                              {comment.authorName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                            {comment.isArchived && (
                              <Badge variant="secondary" className="text-xs">
                                Archived
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            {comment.content}
                          </p>
                        </div>
                        {!comment.isArchived && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchiveComment(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <IconMessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
