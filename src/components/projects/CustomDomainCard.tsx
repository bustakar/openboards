'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

interface Props {
  projectId: string;
  subdomain: string;
}

export function CustomDomainCard({ projectId, subdomain }: Props) {
  const [customDomain, setCustomDomain] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [checkingAt, setCheckingAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'openboards.co';
  const expectedTarget = `${subdomain}.${root}`;

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams({ projectId });
      const res = await fetch(
        `/api/projects/custom-domain?${params.toString()}`,
        {
          cache: 'no-store',
        }
      );
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCustomDomain(data.customDomain || '');
      setVerified(Boolean(data.customDomainVerified));
      setCheckingAt(data.customDomainCheckedAt || null);
    } catch (e) {
      setError('Failed to load custom domain');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function save() {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/projects/custom-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, customDomain: customDomain || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function removeDomain() {
    try {
      setSaving(true);
      const params = new URLSearchParams({ projectId });
      const res = await fetch(
        `/api/projects/custom-domain?${params.toString()}`,
        {
          method: 'DELETE',
        }
      );
      if (!res.ok) throw new Error('Failed to remove');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove');
    } finally {
      setSaving(false);
    }
  }

  async function checkNow() {
    try {
      setLoading(true);
      const res = await fetch('/api/projects/custom-domain/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error('Check failed');
      const data = await res.json();
      setVerified(Boolean(data.customDomainVerified));
      setCheckingAt(data.customDomainCheckedAt || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom domain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Your domain</label>
          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
              disabled={loading || saving}
            />
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            {customDomain && (
              <Button
                variant="outline"
                onClick={removeDomain}
                disabled={saving}
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium">DNS configuration</label>
          {customDomain ? (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Add this record at your DNS provider:</p>
              <pre className="bg-muted p-3 rounded-md overflow-auto">
                {`Type   Name           Target
CNAME  @ or ${customDomain}  ${expectedTarget}`}
              </pre>
              <p>
                After updating DNS, it can take a few minutes to propagate.
                Click Refresh to recheck.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={checkNow}
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Refresh'}
                </Button>
                {verified === true && (
                  <span className="text-green-600">✓ Verified</span>
                )}
                {verified === false && (
                  <span className="text-red-600">✗ Not verified</span>
                )}
                {checkingAt && (
                  <span className="text-xs text-muted-foreground">
                    Last checked: {new Date(checkingAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter a domain and save to see DNS setup instructions.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
