import {
  Invitation,
  Member,
  Organization,
} from 'better-auth/plugins/organization';
import { Card, CardContent } from '../ui/card';
import { InvitationsTable } from './invitations-table';
import { MemberInviteButton } from './member-invite-button';
import { MembersTable } from './members-table';
import { OrganizationDeleteButton } from './org-delete-button';

export type MemberData = Member & {
  name: string;
  email: string;
  isCurrentUser: boolean;
};

export function OrganizationSettings({
  org,
  members,
  invitations,
}: {
  org: Organization;
  members: MemberData[];
  invitations: Invitation[];
}) {
  return (
    <div className="max-w-5xl mx-auto mb-4 p-6">
      <div className="flex flex-row items-center gap-4">
        <div className="text-xl mb-4">Members</div>
        <div className="flex-1" />
        <MemberInviteButton org={org} />
      </div>
      <Card className="my-4">
        <CardContent>
          <MembersTable rows={members} />
        </CardContent>
      </Card>
      <div className="text-xl mb-4">Invitations</div>
      <Card className="my-4">
        <CardContent>
          <InvitationsTable invitations={invitations} />
        </CardContent>
      </Card>
      <div className="text-xl mb-4">Danger Zone</div>
      <Card className="my-4">
        <CardContent>
          <div className="flex flex-row items-center gap-4">
            <div>Delete Organization</div>
            <div className="flex-1" />
            <OrganizationDeleteButton org={org} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
