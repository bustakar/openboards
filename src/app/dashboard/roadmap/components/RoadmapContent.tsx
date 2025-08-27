'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { RoadmapColumn } from './RoadmapColumn';
import { RoadmapItem } from './RoadmapItem';

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

type GroupKey = 'backlog' | 'planned' | 'in_progress' | 'completed';

function statusMeta(status: GroupKey): { label: string; color: string } {
  switch (status) {
    case 'planned':
      return { label: 'Next up', color: 'bg-purple-500' };
    case 'in_progress':
      return { label: 'In Progress', color: 'bg-blue-500' };
    case 'completed':
      return { label: 'Done', color: 'bg-green-500' };
    default:
      return { label: 'Backlog', color: 'bg-gray-500' };
  }
}

export function RoadmapContent() {
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');
  const boardSlug = searchParams.get('board');

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const postId = active.id as string;
    const newStatus = over.id as GroupKey;

    const post = posts.find(p => p.id === postId);
    if (!post || post.status === newStatus) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the post status locally
        setPosts(prev => 
          prev.map(p => 
            p.id === postId ? { ...p, status: newStatus } : p
          )
        );
      } else {
        console.error('Failed to update post status');
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const columns: GroupKey[] = ['backlog', 'planned', 'in_progress', 'completed'];

  const grouped: Record<GroupKey, Post[]> = {
    backlog: [],
    planned: [],
    in_progress: [],
    completed: [],
  };

  // Group posts by status
  posts.forEach(post => {
    if (post.status === 'closed') return;
    if (grouped[post.status as GroupKey]) {
      grouped[post.status as GroupKey].push(post);
    }
  });

  // Sort posts within each group
  Object.keys(grouped).forEach(key => {
    grouped[key as GroupKey].sort((a, b) => {
      // Sort by pinned first, then by vote count, then by last activity
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      if (a.voteCount !== b.voteCount) return b.voteCount - a.voteCount;
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activePost = activeId ? posts.find(p => p.id === activeId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <h1 className="text-2xl font-semibold">
          Roadmap ({posts.length})
          {boardSlug && (
            <span className="text-lg font-normal text-gray-500 ml-2">
              - {boardSlug}
            </span>
          )}
        </h1>
      </div>

      {/* Roadmap Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading roadmap...</div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full">
              {columns.map((status) => {
                const meta = statusMeta(status);
                const list = grouped[status] ?? [];
                
                return (
                  <RoadmapColumn
                    key={status}
                    id={status}
                    title={meta.label}
                    color={meta.color}
                    count={list.length}
                  >
                    <SortableContext
                      items={list.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {list.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-6 text-center bg-white border border-gray-200 rounded-md">
                            No items
                          </div>
                        ) : (
                          list.map((post) => (
                            <RoadmapItem key={post.id} post={post} />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </RoadmapColumn>
                );
              })}
            </div>

            <DragOverlay>
              {activePost ? <RoadmapItem post={activePost} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
