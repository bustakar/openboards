'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RoadmapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Roadmap error caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Roadmap unavailable
        </h2>
        <p className="text-gray-600 max-w-md">
          We're having trouble loading the roadmap. Please try again or check back later.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline">
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
