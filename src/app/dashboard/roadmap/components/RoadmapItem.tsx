'use client';

import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconMessageCircle, IconThumbUp } from '@tabler/icons-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  voteCount: number;
  commentCount: number;
  pinned: boolean;
  lastActivityAt: string;
  boardSlug: string;
}

interface RoadmapItemProps {
  post: Post;
  isDragging?: boolean;
}

export function RoadmapItem({ post, isDragging }: RoadmapItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-gray-200 rounded-md p-3 cursor-grab active:cursor-grabbing transition-colors ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-gray-50'
      } ${post.pinned ? 'ring-2 ring-blue-200' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm line-clamp-2">
            {post.title}
            {post.pinned && (
              <span className="ml-1 text-blue-500">📌</span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <IconMessageCircle className="w-3 h-3" />
              <span>{post.commentCount}</span>
            </span>
            <span>{formatDate(post.lastActivityAt)}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col items-center gap-0.5 text-sm font-semibold text-gray-600">
            <IconThumbUp className="w-4 h-4" />
            <span>{post.voteCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
