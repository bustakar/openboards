'use client';

import { authClient } from '@/lib/auth-client';

export default function DashboardPage() {
  const activeOrg = authClient.useActiveOrganization().data;

  return (
    <div className="flex flex-col gap-2 m-4">
      <div className="flex flex-col">
        <p>You&apos;re successfully logged in! This is your dashboard</p>
        <p>
          Selected organization: <b>{activeOrg?.name}</b>{' '}
        </p>
      </div>
    </div>
  );
}
