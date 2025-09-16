import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import {
  getPublicPostsByOrgSlug,
  PostsListOptions,
} from '@/server/repo/public-post-repo';
import { getVisitorId } from '@/server/service/public-visitor';
import { PostStatusBadge } from '../post/post-status-badge';
import { PostsListFilterButton } from '../post/posts-list-filter-button';
import { PostsListSortButton } from '../post/posts-list-sort-button';
import { Search } from '../search';
import { SubmitPostButton } from './public-submit-post-button';
import { PublicVoteButton } from './public-vote-button';

export async function PublicPostsList({
  orgSlug,
  options,
}: {
  orgSlug: string;
  options: PostsListOptions;
}) {
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) return null;
  const [boards, visitorId] = await Promise.all([
    getBoardsByOrgSlug(orgSlug),
    getVisitorId(),
  ]);

  const posts = await getPublicPostsByOrgSlug(orgSlug, options, visitorId);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between gap-2 w-full">
        <h2 className="text-base font-medium">Posts</h2>
        <div className="flex items-center gap-2">
          <Search initial={options.search} />
          <PostsListSortButton />
          <PostsListFilterButton />
          <SubmitPostButton
            orgSlug={orgSlug}
            boards={boards.map((b) => ({
              id: b.id,
              title: b.title,
              icon: b.icon,
            }))}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {posts.length === 0 ? (
          <li className="text-muted-foreground text-sm">No posts yet.</li>
        ) : (
          posts.map((p) => (
            <li
              key={p.id}
              className="border rounded-md p-3 flex gap-3 items-start w-full"
            >
              <div className="flex flex-col gap-2 w-full">
                <PostStatusBadge status={p.status} />
                <span className="truncate font-medium">{p.title}</span>
                <div className="text-muted-foreground line-clamp-2 text-sm">
                  {p.description}
                </div>
                <div className="text-muted-foreground text-xs mt-1 flex items-center gap-2">
                  <div className="bg-muted rounded-md py-1 px-2 flex items-center gap-2">
                    <span>{p.boardIcon}</span>
                    <span className="truncate">{p.boardTitle}</span>
                  </div>
                  <span>•</span>
                  <span>
                    {new Date(
                      p.createdAt as unknown as string
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <PublicVoteButton
                orgSlug={orgSlug}
                postId={p.id}
                initialVoted={p.hasVoted as boolean}
                initialCount={p.votesCount as number}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
