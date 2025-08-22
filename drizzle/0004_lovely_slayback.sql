-- First add the column as nullable
ALTER TABLE "projects" ADD COLUMN "user_id" uuid;
--> statement-breakpoint

-- Update existing projects to have a default user (we'll need to create one or use existing)
-- For now, let's create a default user if none exists and assign all projects to it
INSERT INTO "users" ("id", "email", "password_hash", "created_at", "updated_at")
SELECT 
  gen_random_uuid(),
  'admin@openboards.co',
  '$2b$10$dummy.hash.for.existing.projects',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "users" LIMIT 1);
--> statement-breakpoint

-- Update all existing projects to use the first user
UPDATE "projects" 
SET "user_id" = (SELECT "id" FROM "users" LIMIT 1)
WHERE "user_id" IS NULL;
--> statement-breakpoint

-- Now make the column not null
ALTER TABLE "projects" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint

-- Add the foreign key constraint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;