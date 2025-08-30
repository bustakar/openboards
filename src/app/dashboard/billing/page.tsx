import { BillingClient } from '@/components/billing/BillingClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { listProjectsByUser } from '@/server/repos/projects/projects';
import { headers } from 'next/headers';

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id as string | undefined;
  const projects = userId ? await listProjectsByUser(userId) : [];

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Manage your subscription. All plans include a 14-day free trial.
          </p>
          <BillingClient />
        </CardContent>
      </Card>
    </div>
  );
}
