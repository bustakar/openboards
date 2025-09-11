import { PostStatus } from '@/db/schema';
import { getBoardsByOrgSlug } from '@/server/repo/board-repo';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import { getPublicPostsByOrgSlug } from '@/server/repo/public-post-repo';
import { getVisitorId } from '@/server/service/public-visitor';
import { PostStatusBadge } from '../post/post-status-badge';
import { SubmitPostButton } from './public-submit-post-button';
import { PublicVoteButton } from './public-vote-button';

export async function PublicPostsList({
  orgSlug,
  boardId,
  statuses,
}: {
  orgSlug: string;
  boardId?: string;
  statuses?: string[];
}) {
  const org = await getOrganizationBySlug(orgSlug);
  if (!org) return null;
  const [boards, visitorId] = await Promise.all([
    getBoardsByOrgSlug(orgSlug),
    getVisitorId(),
  ]);

  const posts = await getPublicPostsByOrgSlug(
    orgSlug,
    visitorId,
    statuses as PostStatus[],
    boardId
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Posts</h2>
        <SubmitPostButton
          orgSlug={orgSlug}
          boards={boards.map((b) => ({
            id: b.id,
            title: b.title,
            icon: b.icon,
          }))}
        />
      </div>

      <ul className="space-y-2">
        {posts.length === 0 ? (
          <li className="text-muted-foreground text-sm">No posts yet.</li>
        ) : (
          posts.map((p) => (
            <li
              key={p.id}
              className="border rounded-md p-3 flex gap-3 items-start"
            >
              <PublicVoteButton
                orgSlug={orgSlug}
                postId={p.id}
                initialVoted={p.hasVoted as boolean}
                initialCount={p.votesCount as number}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{p.title}</span>
                  <PostStatusBadge status={p.status} />
                </div>
                <div className="text-muted-foreground line-clamp-2 text-sm">
                  {p.description}
                </div>
                <div className="text-muted-foreground text-xs mt-1 flex items-center gap-2">
                  <span>{p.boardIcon}</span>
                  <span className="truncate">{p.boardTitle}</span>
                  <span>•</span>
                  <span>
                    {new Date(
                      p.createdAt as unknown as string
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
