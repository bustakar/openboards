import { OrganizationMetadata } from '@/types/organization';
import {
  Invitation,
  Member,
  Organization,
} from 'better-auth/plugins/organization';
import { Separator } from '../ui/separator';
import { InvitationsTable } from './invitations-table';
import { MemberInviteButton } from './member-invite-button';
import { MembersTable } from './members-table';
import { CustomDomainSettings } from './org-custom-domain-settings';
import { OrganizationDeleteButton } from './org-delete-button';
import { OrgPublicSettings } from './org-public-settings';

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
  metadata,
  customDomain,
}: {
  editAllowed: boolean;
  org: Organization;
  members: MemberData[];
  invitations: Invitation[];
  metadata?: OrganizationMetadata;
  customDomain?: string;
}) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-24">
      <div className="space-y-4">
        <div className="flex flex-row items-center gap-4">
          <div className="text-xl">Public Settings</div>
          <div className="flex-1" />
        </div>
        <Separator orientation="horizontal" />
        <OrgPublicSettings
          orgSlug={org.slug}
          editAllowed={editAllowed}
          organizationMetadata={metadata}
        />
      </div>
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
      {process.env.CUSTOM_DOMAINS_PROVIDER !== 'disabled' && (
        <div className="space-y-4">
          <div className="text-xl">Custom Domain</div>
          <Separator orientation="horizontal" />
          <CustomDomainSettings
            org={org}
            editAllowed={editAllowed}
            initialDomain={customDomain || undefined}
          />
        </div>
      )}
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
