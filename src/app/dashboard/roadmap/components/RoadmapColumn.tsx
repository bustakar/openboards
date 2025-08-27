'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface RoadmapColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export function RoadmapColumn({ id, title, color, count, children }: RoadmapColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <section
      ref={setNodeRef}
      className={`bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col min-h-0 ${
        isOver ? 'bg-blue-50 border-blue-300' : ''
      }`}
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="text-sm font-semibold text-gray-700">
            {title}
          </span>
        </div>
        <span className="text-xs text-gray-500">{count}</span>
      </header>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </section>
  );
}
