'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';

const plans = [
  { key: 'single', label: 'Single (1 project)', lookup: 'PRICE_SINGLE' },
  { key: 'multi_3', label: 'Team (3 projects)', lookup: 'PRICE_MULTI_3' },
  {
    key: 'multi_10',
    label: 'Business (10 projects)',
    lookup: 'PRICE_MULTI_10',
  },
];

export function BillingClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onUpgrade = async (planKey: string) => {
    try {
      setLoading(planKey);
      setError(null);
      const successUrl = '/dashboard/billing';
      const cancelUrl = '/dashboard/billing';
      type ClientWithStripe = {
        subscription: {
          upgrade: (args: {
            plan: string;
            successUrl: string;
            cancelUrl: string;
            annual?: boolean;
            subscriptionId?: string;
          }) => Promise<{ error?: { message?: string } | null }>;
        };
      };
      const client = authClient as unknown as ClientWithStripe;
      const { error } = await client.subscription.upgrade({
        plan: planKey,
        successUrl,
        cancelUrl,
      });
      if (error) setError(error.message || 'Failed to start checkout');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Upgrade failed');
    } finally {
      setLoading(null);
    }
  };

  const onPortal = async () => {
    try {
      setLoading('portal');
      setError(null);
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Portal error');
      window.location.href = data.url;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Portal failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((p) => (
          <Button
            key={p.key}
            onClick={() => onUpgrade(p.key)}
            disabled={loading !== null}
          >
            {loading === p.key ? 'Processing...' : `Choose ${p.label}`}
          </Button>
        ))}
      </div>
      <Button variant="outline" onClick={onPortal} disabled={loading !== null}>
        {loading === 'portal' ? 'Opening portal...' : 'Manage billing'}
      </Button>
    </div>
  );
}
