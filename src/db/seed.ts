import { boards, posts } from '@/db/schema';
import { getDatabase } from '@/server/db';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function seed() {
  const { db } = getDatabase();

  const existingFeatures = await db
    .select()
    .from(boards)
    .where(eq(boards.slug, 'features'));
  let featuresId = existingFeatures[0]?.id;
  if (!featuresId) {
    const [inserted] = await db
      .insert(boards)
      .values({
        name: 'Features',
        slug: 'features',
        description: 'Feature requests',
        icon: '💡',
        position: 1,
      })
      .returning({ id: boards.id });
    featuresId = inserted.id;
  }

  const existingBugs = await db
    .select()
    .from(boards)
    .where(eq(boards.slug, 'bugs'));
  let bugsId = existingBugs[0]?.id;
  if (!bugsId) {
    const [inserted] = await db
      .insert(boards)
      .values({
        name: 'Bugs',
        slug: 'bugs',
        description: 'Bug reports',
        icon: '🐛',
        position: 2,
      })
      .returning({ id: boards.id });
    bugsId = inserted.id;
  }

  // Optional demo posts (idempotent by slug)
  await upsertPost(
    db,
    featuresId!,
    'Dark mode',
    'Please add dark mode support.'
  );
  await upsertPost(
    db,
    featuresId!,
    'Mobile app',
    'A mobile app would be great.'
  );
  await upsertPost(
    db,
    bugsId!,
    'Crash on submit',
    'The app crashes when submitting a post.'
  );
}

async function upsertPost(
  db: ReturnType<typeof getDatabase>['db'],
  boardId: string,
  title: string,
  body: string
) {
  const slug = slugify(title);
  const existing = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
  if (existing.length > 0) return;
  await db
    .insert(posts)
    .values({ boardId, title, body, slug, status: 'backlog' });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

seed().then(() => {
  console.log('Seed complete');
  process.exit(0);
});
