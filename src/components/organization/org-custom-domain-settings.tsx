'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  checkCustomDomainAction,
  removeCustomDomainAction,
  saveCustomDomainAction,
  verifyCustomDomainAction,
} from '@/server/service/custom-domain-service';
import type { Organization } from 'better-auth/plugins/organization';
import { useState } from 'react';

interface DomainDetails {
  domain: string;
  configuredBy: string;
  misconfigured: boolean;
  recommendations: Array<{ type: string; value: string }>;
  tips: {
    subdomain: string;
    apex: string;
  };
}

export function CustomDomainSettings({
  org,
  editAllowed,
  initialDomain,
}: {
  org: Organization;
  editAllowed: boolean;
  initialDomain?: string | null;
}) {
  const [domain, setDomain] = useState(initialDomain || '');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<DomainDetails | null>(null);

  const onCheck = async () => {
    setMessage('');
    setDetails(null);
    setChecking(true);
    try {
      const result = await checkCustomDomainAction({ domain });
      setDetails(result);
      setMessage(
        result.misconfigured
          ? 'Domain is added but DNS appears misconfigured.'
          : 'Domain appears correctly configured.'
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to check domain');
    } finally {
      setChecking(false);
    }
  };

  const onSave = async () => {
    setMessage('');
    setSaving(true);
    try {
      await saveCustomDomainAction({ orgSlug: org.slug!, domain });
      setMessage('Saved. If not yet configured, add DNS as shown below.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save domain');
    } finally {
      setSaving(false);
    }
  };

  const onVerify = async () => {
    setMessage('');
    setVerifying(true);
    try {
      await verifyCustomDomainAction({
        orgSlug: org.slug!,
        domain,
      });
      setMessage('Verification requested with Vercel.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to verify domain');
    } finally {
      setVerifying(false);
    }
  };

  const onRemove = async () => {
    setMessage('');
    setRemoving(true);
    try {
      await removeCustomDomainAction({ orgSlug: org.slug! });
      setDomain('');
      setDetails(null);
      setMessage('Custom domain removed.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to remove domain');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="feedback.yourdomain.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={!editAllowed}
        />
        <Button onClick={onCheck} disabled={!editAllowed || checking}>
          {checking ? 'Checking…' : 'Check'}
        </Button>
        <Button onClick={onSave} disabled={!editAllowed || saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {domain ? (
          <Button onClick={onVerify} disabled={!editAllowed || verifying}>
            {verifying ? 'Verifying…' : 'Verify'}
          </Button>
        ) : null}
        {initialDomain ? (
          <Button
            variant="outline"
            onClick={onRemove}
            disabled={!editAllowed || removing}
          >
            {removing ? 'Removing…' : 'Remove'}
          </Button>
        ) : null}
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
      {details ? (
        <div className="rounded-md border p-3 bg-muted/30 text-sm space-y-2">
          <div className="font-medium">Vercel DNS guidance</div>
          <div>
            Subdomains: set CNAME to{' '}
            <span className="font-mono">cname.vercel-dns.com</span>
          </div>
          <div>
            Apex: use ALIAS/ANAME to{' '}
            <span className="font-mono">cname.vercel-dns.com</span> or A to{' '}
            <span className="font-mono">76.76.21.21</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
