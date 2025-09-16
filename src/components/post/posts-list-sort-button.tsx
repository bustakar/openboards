'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function PostsListSortButton() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value && value !== 'new') params.set('sort', value);
    else params.delete('sort');
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-10 h-9 p-0">
          <ArrowUpDown className="size-4" />
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
