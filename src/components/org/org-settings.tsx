import {
  Invitation,
  Member,
  Organization,
} from 'better-auth/plugins/organization';
import { Separator } from '../ui/separator';
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
  editAllowed,
  org,
  members,
  invitations,
}: {
  editAllowed: boolean;
  org: Organization;
  members: MemberData[];
  invitations: Invitation[];
}) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-24">
      <div className="space-y-4">
        <div className="flex flex-row items-center gap-4">
          <div className="text-xl">Members</div>
          <div className="flex-1" />
          <MemberInviteButton org={org} />
        </div>
        <Separator orientation="horizontal" />
        <MembersTable editAllowed={editAllowed} rows={members} />
      </div>
      <div className="space-y-4">
        <div className="text-xl">Invitations</div>
        <Separator orientation="horizontal" />
        <InvitationsTable invitations={invitations} />
      </div>
      <div className="space-y-4">
        <div className="text-xl">Danger Zone</div>
        <Separator orientation="horizontal" />
        <div className="flex flex-row items-center gap-4">
          <div>Delete Organization</div>
          <div className="flex-1" />
          <OrganizationDeleteButton org={org} />
        </div>
      </div>
    </div>
  );
}
