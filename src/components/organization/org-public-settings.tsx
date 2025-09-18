'use client';

import {
  ALL_POST_STATUSES,
  POST_STATUS_LABELS,
} from '@/components/post/post-status-badge';
import { Button } from '@/components/ui/button';
import type { PostStatus } from '@/db/schema';
import { saveOrganizationSettingsAction } from '@/server/service/org-service';
import {
  DEFAULT_ORG_SETTINGS as DEFAULT_ORGANIZATION_METADATA,
  OrganizationMetadata,
} from '@/types/organization';
import { useMemo, useState, useTransition } from 'react';

function StatusRow({
  label,
  selected,
  onToggle,
  disabled,
}: {
  label: string;
  selected: Set<PostStatus>;
  onToggle: (s: PostStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center flex-wrap gap-3">
      <div className="text-sm text-muted-foreground min-w-56">{label}</div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {ALL_POST_STATUSES.map((s) => {
          const isOn = selected.has(s);
          return (
            <Button
              key={s}
              size="sm"
              variant={isOn ? 'default' : 'outline'}
              onClick={() => onToggle(s)}
              disabled={disabled}
            >
              {POST_STATUS_LABELS[s]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function OrgPublicSettings({
  orgSlug,
  editAllowed,
  organizationMetadata,
}: {
  orgSlug: string;
  editAllowed: boolean;
  organizationMetadata?: OrganizationMetadata;
}) {
  const metadata = organizationMetadata ?? DEFAULT_ORGANIZATION_METADATA;

  const initialBadgeSet = useMemo(
    () =>
      new Set(
        ALL_POST_STATUSES.filter((s) =>
          metadata.public.postBadgeVisibility.includes(s)
        )
      ),
    [metadata]
  );
  const initialDefaultSet = useMemo(
    () =>
      new Set(
        ALL_POST_STATUSES.filter((s) =>
          metadata.public.defaultStatusVisible.includes(s)
        )
      ),
    [metadata]
  );

  const [badgeSet, setBadgeSet] = useState(initialBadgeSet);
  const [defaultSet, setDefaultSet] = useState(initialDefaultSet);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const next: OrganizationMetadata = {
        ...metadata,
        public: {
          ...metadata.public,
          postBadgeVisibility: Array.from(badgeSet.values()),
          defaultStatusVisible: Array.from(defaultSet.values()),
        },
      };
      await saveOrganizationSettingsAction(orgSlug, next);
    });

  return (
    <div className="space-y-4">
      <div className="text-xl">Posts List</div>
      <StatusRow
        label="Which posts are visible in the public list?"
        selected={defaultSet}
        onToggle={(s) =>
          setDefaultSet((prev) => {
            const next = new Set(prev);
            next.has(s) ? next.delete(s) : next.add(s);
            return next;
          })
        }
        disabled={!editAllowed || pending}
      />

      <div className="text-xl">Post Card</div>
      <StatusRow
        label="Which badges are visible on post card?"
        selected={badgeSet}
        onToggle={(s) =>
          setBadgeSet((prev) => {
            const next = new Set(prev);
            next.has(s) ? next.delete(s) : next.add(s);
            return next;
          })
        }
        disabled={!editAllowed || pending}
      />

      <Button size="sm" onClick={save} disabled={!editAllowed || pending}>
        Save changes
      </Button>
    </div>
  );
}
