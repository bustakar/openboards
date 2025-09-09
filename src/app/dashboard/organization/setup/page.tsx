'use client';

import { OrganizationForm } from '@/components/organization/org-form';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export default function OrganizationPage() {
  const session = authClient.useSession().data;

  const handleSignOut = async () => {
    await authClient.signOut();
    redirect('/login');
  };
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          openboards
        </a>
        <OrganizationForm />
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            Signed in as {session?.user?.email}
          </span>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
