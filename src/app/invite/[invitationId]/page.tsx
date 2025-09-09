import InviteCardContent from '@/components/invitation-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function InvitePage({
  params,
}: {
  params: { invitationId: string };
}) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session) {
    redirect('/login');
  }

  const invitation = await auth.api.getInvitation({
    query: { id: params.invitationId },
    headers: h,
  });

  if (!invitation) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invitation not found</CardTitle>
          </CardHeader>
          <CardContent>It may have been revoked or expired.</CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.email !== session.user.email) {
    return (
      <div className="space-y-3">
        <p>
          You are signed in as {session.user.email}, but this invite is for{' '}
          {invitation.email}.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            await auth.api.signOut({ headers: h });
            // TODO: Refresh page
          }}
        >
          Switch account
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            Invitation to join {invitation.organizationName}
          </CardTitle>
        </CardHeader>
        <InviteCardContent invitation={invitation} />
      </Card>
    </div>
  );
}
