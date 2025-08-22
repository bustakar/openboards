'use client';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      Sign out
    </Button>
  );
}
