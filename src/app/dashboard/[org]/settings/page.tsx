import {
  MemberData,
  OrganizationSettings,
} from '@/components/organization/org-settings';
import { auth } from '@/server/auth';
import { OrganizationMetadata } from '@/types/organization';
import { Organization } from 'better-auth/plugins/organization';
import { headers } from 'next/headers';

export default async function OrganizationSettingsPage({
  params,
}: {
  params: { org: string };
}) {
  const h = await headers();
  const { org } = await params;
  const userId = (await auth.api.getSession({ headers: h }))?.user.id;
  const fullOrganization = await auth.api.getFullOrganization({
    query: {
      organizationSlug: org,
    },
    headers: h,
  });

  const organization = {
    id: fullOrganization?.id,
    name: fullOrganization?.name,
    slug: fullOrganization?.slug,
    logo: fullOrganization?.logo,
    createdAt: fullOrganization?.createdAt,
    metadata: fullOrganization?.metadata,
  } as Organization;

  const members = fullOrganization?.members.map((member) => ({
    ...member,
    name: member.user.name,
    email: member.user.email,
    isCurrentUser: member.userId === userId,
  })) as MemberData[];

  const invitations = fullOrganization?.invitations || [];

  const editAllowed =
    members.find((member) => member.userId === userId)?.role === 'owner';

  let organizationMetadata: OrganizationMetadata | undefined = undefined;
  try {
    if (organization.metadata) {
      organizationMetadata = JSON.parse(
        organization.metadata
      ) as OrganizationMetadata;
    }
  } catch {
    organizationMetadata = undefined;
  }

  return (
    <div className="p-6">
      <OrganizationSettings
        editAllowed={editAllowed}
        org={organization}
        members={members}
        invitations={invitations}
        metadata={organizationMetadata}
        customDomain={fullOrganization?.customDomain}
      />
    </div>
  );
}
