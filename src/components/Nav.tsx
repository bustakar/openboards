'use client';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function Nav({ title = 'OpenBoards' }: { title?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNewPost = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('new', 'true');
    router.push(`?${params.toString()}`);
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-semibold">
          {title}
        </Link>
        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/">Feedback</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/roadmap">Roadmap</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Button onClick={handleNewPost} size="sm">
            New Post
          </Button>
        </div>
      </div>
    </header>
  );
}
