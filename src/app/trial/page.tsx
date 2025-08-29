'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function TrialGateInner() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get('return') || '/dashboard';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTrial = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/billing/start-trial', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'internal_error');
      router.replace(returnTo);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'internal_error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          openboards.co
        </a>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Start your free trial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Get full access for 14 days. No credit card required.
            </p>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button className="w-full" onClick={startTrial} disabled={loading}>
              {loading ? 'Starting trial...' : 'Start 14‑day trial'}
            </Button>
            <div className="text-center">
              <a href="/dashboard/billing" className="text-sm underline">
                Prefer to subscribe now? Go to billing
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TrialGatePage() {
  return (
    <Suspense>
      <TrialGateInner />
    </Suspense>
  );
}
