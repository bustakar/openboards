import { PublicBoardsList } from '@/components/public/public-boards-list';
import { PublicPostsList } from '@/components/public/public-posts-list';
import { PublicTopNav } from '@/components/public/public-top-nav';
import { Separator } from '@/components/ui/separator';
import { PostStatus } from '@/db/schema';
import {
  getOrganizationBySlug,
  getOrganizationSettingsBySlug,
} from '@/server/repo/org-repo';
import {
  PostsListOptions,
  PostsListSort,
} from '@/server/repo/public-post-repo';
import { OrganizationMetadata } from '@/types/organization';

export default async function PublicFeedbackPage({
  params,
  searchParams,
}: {
  params: { org: string };
  searchParams?: {
    board?: string;
    statuses?: string;
    search?: string;
    sort?: string;
  };
}) {
  const { org } = await params;
  const sp = await searchParams;

  const organization = await getOrganizationBySlug(org);
  const metadata: OrganizationMetadata =
    await getOrganizationSettingsBySlug(org);

  const statuses: PostStatus[] = sp?.statuses
    ? (sp.statuses.split(',').filter(Boolean) as PostStatus[])
    : metadata.public.defaultStatusVisible;

  const options: PostsListOptions = {
    statuses: statuses,
    boardId: sp?.board || undefined,
    search: sp?.search || '',
    sort: (sp?.sort as PostsListSort) || 'new',
  };

  return (
    <div className="mx-auto">
      <div className="max-w-7xl mx-auto p-4">
        <PublicTopNav
          organizationName={organization?.name || org}
          organizationSlug={org}
        />
      </div>
      <Separator className="mb-4" />
      <div className="max-w-7xl mx-auto flex md:flex-row flex-col gap-6 p-4">
        <div className="min-w-64">
          <PublicBoardsList orgSlug={org} selectedBoardId={options.boardId} />
        </div>
        <div className="w-full">
          <PublicPostsList
            orgSlug={org}
            options={options}
            settings={metadata.public}
          />
        </div>
      </div>
    </div>
  );
}
