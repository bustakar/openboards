import { POST_STATUSES, type PostStatus } from './status';

export type OrganizationPublicMetadata = {
  postBadgeVisibility: PostStatus[];
  defaultStatusVisible: PostStatus[];
};

export type OrganizationMetadata = {
  public: OrganizationPublicMetadata;
};

export const DEFAULT_ORG_SETTINGS: OrganizationMetadata = {
  public: {
    postBadgeVisibility: POST_STATUSES.filter((s) => !(s === 'open')),
    defaultStatusVisible: POST_STATUSES.filter(
      (s) => !(s === 'done' || s === 'closed')
    ),
  },
};
