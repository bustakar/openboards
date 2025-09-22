'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function PostsListSortButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'new') params.set('sort', value);
    else params.delete('sort');
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {(() => {
            const sort = searchParams.get('sort');
            switch (sort) {
              case 'hot':
                return 'Hot';
              case 'top':
                return 'Top';
              case 'old':
                return 'Oldest';
              default:
                return 'Newest';
            }
          })()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange('new')}>
          Newest
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('hot')}>Hot</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('top')}>Top</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('old')}>
          Oldest
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
