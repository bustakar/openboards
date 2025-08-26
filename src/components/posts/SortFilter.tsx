'use client';
import Link from 'next/link';

interface SortFilterProps {
  basePath: string;
  currentSort?: 'trending' | 'new' | 'top';
}

export function SortFilter({ basePath, currentSort }: SortFilterProps) {
  return (
    <div className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1">
      <Link
        href={`${basePath}?sort=trending`}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          currentSort === 'trending'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Trending
      </Link>
      <Link
        href={`${basePath}?sort=new`}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          currentSort === 'new'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        New
      </Link>
      <Link
        href={`${basePath}?sort=top`}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          currentSort === 'top'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Top
      </Link>
    </div>
  );
}
