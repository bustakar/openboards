'use client';

import { authClient } from '@/lib/auth-client';
import { Invitation } from 'better-auth/plugins';
import { redirect } from 'next/navigation';
import { Button } from './ui/button';
import { CardContent } from './ui/card';

const acceptInvitationAction = async (invitation: Invitation) => {
  await authClient.organization.acceptInvitation({
    invitationId: invitation.id,
  });
  await authClient.organization.setActive({
    organizationId: invitation.organizationId,
  });
  redirect(`/dashboard/${invitation.organizationId}/feedback`);
};

const rejectInvitationAction = async (invitationId: string) => {
  await authClient.organization.rejectInvitation({
    invitationId: invitationId,
  });
  redirect('/dashboard');
};

export default function InviteCardContent({
  invitation,
  organizationName,
}: {
  invitation: Invitation;
  organizationName: string;
}) {
  return (
    <CardContent className="space-y-4">
      <div className="space-y-3">
        <p>
          Accept invitation and join <b>{organizationName}</b> as{' '}
          <b>{invitation.email}</b>.
        </p>
        <Button
          type="submit"
          onClick={() => acceptInvitationAction(invitation)}
          className="w-full"
        >
          Accept invitation
        </Button>
        <Button
          type="submit"
          onClick={() => rejectInvitationAction(invitation.id)}
          variant="outline"
          className="w-full"
        >
          Reject
        </Button>
      </div>
    </CardContent>
  );
}
