'use client';

import { authClient } from '@/lib/auth-client';
import { Invitation } from 'better-auth/plugins';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';
import { CardContent } from './ui/card';

async function acceptInvitationAction(
  invitation: Invitation,
  navigate: (to: string) => void
) {
  await authClient.organization.acceptInvitation({
    invitationId: invitation.id,
  });
  await authClient.organization.setActive({
    organizationId: invitation.organizationId,
  });
  const org = (await authClient.organization.getFullOrganization()).data;
  if (!org) throw new Error('Organization not found');
  navigate(`/dashboard/${org.slug}/feedback`);
}

async function rejectInvitationAction(
  invitationId: string,
  navigate: (to: string) => void
) {
  await authClient.organization.rejectInvitation({
    invitationId: invitationId,
  });
  navigate('/dashboard');
}

export default function InviteCardContent({
  invitation,
  organizationName,
}: {
  invitation: Invitation;
  organizationName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onAccept = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await acceptInvitationAction(invitation, (to) => router.push(to));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept invitation');
    } finally {
      setBusy(false);
    }
  };

  const onReject = async () => {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      await rejectInvitationAction(invitation.id, (to) => router.push(to));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reject invitation');
    } finally {
      setBusy(false);
    }
  };
  return (
    <CardContent className="space-y-4">
      <div className="space-y-3">
        <p>
          Accept invitation and join <b>{organizationName}</b> as{' '}
          <b>{invitation.email}</b>.
        </p>
        <Button
          type="submit"
          onClick={() => onAccept()}
          className="w-full"
          disabled={busy}
        >
          {busy ? 'Processing…' : 'Accept invitation'}
        </Button>
        <Button
          type="submit"
          onClick={() => onReject()}
          variant="outline"
          className="w-full"
          disabled={busy}
        >
          Reject
        </Button>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </CardContent>
  );
}
