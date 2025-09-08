import {
  MemberData,
  OrganizationSettings,
} from '@/components/org/org-settings';
import { auth } from '@/server/auth';
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
  } as Organization;

  const members = fullOrganization?.members.map((member) => ({
    ...member,
    name: member.user.name,
    email: member.user.email,
    isCurrentUser: member.userId === userId,
  })) as MemberData[];

  const invitations = fullOrganization?.invitations;

  return (
    <div className="p-6">
      <OrganizationSettings
        org={organization}
        members={members}
        invitations={invitations}
      />
    </div>
  );
}
