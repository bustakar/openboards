'use server';

import { db } from '@/db';
import { board, post } from '@/db/schema';
import { getOrganizationBySlug } from '@/server/repo/org-repo';
import { publicFeedbackPath } from '@/server/service/path-service';
import { and, eq, gt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getOrSetVisitorId } from './public-visitor';

export async function createPublicPostAction(input: {
  orgSlug: string;
  boardId: string;
  title: string;
  description: string;
  hp?: string; // honeypot
}) {
  const schema = z.object({
    orgSlug: z.string().min(1),
    boardId: z.string().min(1),
    title: z.string().min(1).max(140),
    description: z.string().max(2000),
    hp: z.string().optional(),
  });
  const parsed = schema.parse(input);
  if (parsed.hp && parsed.hp.trim() !== '') return;

  const org = await getOrganizationBySlug(parsed.orgSlug);
  if (!org) throw new Error('Organization not found');

  const visitorId = await getOrSetVisitorId();

  // rate limit: max 3 posts / hour per visitor/org
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db
    .select({ id: post.id })
    .from(post)
    .where(
      and(
        eq(post.organizationId, org.id),
        eq(post.createdByVisitorId, visitorId),
        gt(post.createdAt, since)
      )
    );
  if (recent.length >= 3)
    throw new Error('You are submitting too fast. Try again later.');

  const b = await db.query.board.findFirst({
    where: and(eq(board.id, parsed.boardId), eq(board.organizationId, org.id)),
    columns: { id: true },
  });
  if (!b) throw new Error('Invalid board');

  await db.insert(post).values({
    id: crypto.randomUUID(),
    organizationId: org.id,
    boardId: parsed.boardId,
    title: parsed.title.trim(),
    description: parsed.description.trim(),
    status: 'open',
    createdByUserId: null,
    createdByVisitorId: visitorId,
  });

  revalidatePath(publicFeedbackPath(parsed.orgSlug));
}
