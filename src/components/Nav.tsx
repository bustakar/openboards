import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { getCurrentProjectFromHeaders } from '@/server/repos/projects';
import Link from 'next/link';

export async function Nav() {
  const project = await getCurrentProjectFromHeaders();
  const title = project?.name ?? 'OpenBoards';
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-semibold">
          {title}
        </Link>
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
      </div>
    </header>
  );
}
