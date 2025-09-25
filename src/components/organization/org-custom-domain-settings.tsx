'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VerifyInstruction } from '@/server/custom-domain/custom-domain-adapter';
import {
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
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<DomainDetails | null>(null);
  const [instructions, setInstructions] = useState<VerifyInstruction[]>([]);

  const onSave = async () => {
    setMessage('');
    setInstructions([]);
    setSaving(true);
    try {
      await removeCustomDomainAction({ orgSlug: org.slug! });
      await saveCustomDomainAction({ orgSlug: org.slug!, domain });
      onVerify();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save domain');
    } finally {
      setSaving(false);
    }
  };

  const onVerify = async () => {
    setMessage('');
    setInstructions([]);
    setVerifying(true);
    try {
      const result = await verifyCustomDomainAction({
        orgSlug: org.slug!,
        domain,
      });
      if (result.configured) {
        setMessage('Domain configured.');
      } else if (result.verified && !result.configured) {
        setMessage(
          'Domain not configured. Make sure to add the following DNS records to your DNS provider:'
        );
        setInstructions(result.instructions);
      } else {
        setMessage('Domain verification failed.');
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to verify domain');
    } finally {
      setVerifying(false);
    }
  };

  const onRemove = async () => {
    setMessage('');
    setInstructions([]);
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
        {initialDomain !== domain ? (
          <Button onClick={onSave} disabled={!editAllowed || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        ) : null}
        {initialDomain === domain ? (
          <Button onClick={onVerify} disabled={!editAllowed || verifying}>
            {verifying ? 'Verifying…' : 'Verify'}
          </Button>
        ) : null}
        {initialDomain === domain ? (
          <Button
            variant="outline"
            onClick={onRemove}
            disabled={!editAllowed || removing}
          >
            {removing ? 'Removing…' : 'Remove'}
          </Button>
        ) : null}
      </div>
      {message ? (
        <pre className="text-sm whitespace-pre-wrap">{message}</pre>
      ) : null}
      {details ? <p>{details.toString()}</p> : null}
      {instructions.length > 0 ? (
        <div className="space-y-1">
          {instructions.map((inst) => (
            <div key={inst.value} className="text-sm">
              {inst.rank === 1 ? (
                <span>
                  - CNAME <b>{inst.value}</b> (preferred)
                </span>
              ) : (
                <span>
                  - CNAME <b>{inst.value}</b>
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
