import { PublicBoardsList } from '@/components/public/public-boards-list';
import { PublicPostsList } from '@/components/public/public-posts-list';
import { PublicTopNav } from '@/components/public/public-top-nav';
import { Separator } from '@/components/ui/separator';
import { PostStatus } from '@/db/schema';
import { z } from 'zod';

import { OrgSlugSchema } from '@/server/lib/params';
import {
  getOrganizationBySlug,
  getOrganizationPublicSettingsBySlug,
} from '@/server/repo/org-repo';
import {
  PostsListOptions,
  PostsListSort,
} from '@/server/repo/public-post-repo';
import { OrganizationPublicMetadata } from '@/types/organization';

const QuerySchema = z.object({
  board: z.string().min(1).optional(),
  statuses: z
    .string()
    .transform((v) => (v ? v.split(',').filter(Boolean) : []))
    .optional(),
  search: z.string().optional(),
  sort: z.enum(['new', 'top', 'hot', 'old']).optional(),
});

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
  const { org } = OrgSlugSchema.parse(params);
  const sp = QuerySchema.parse(searchParams ?? {});

  const organization = await getOrganizationBySlug(org);
  const settings: OrganizationPublicMetadata =
    await getOrganizationPublicSettingsBySlug(org);

  const statuses: PostStatus[] =
    (sp.statuses as PostStatus[] | undefined) ?? settings.defaultStatusVisible;

  const options: PostsListOptions = {
    statuses: statuses,
    boardId: sp.board || undefined,
    search: sp.search || '',
    sort: (sp.sort as PostsListSort) || 'new',
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
            settings={settings}
          />
        </div>
      </div>
    </div>
  );
}
