CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subdomain" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
ALTER TABLE "boards" DROP CONSTRAINT "boards_slug_unique";--> statement-breakpoint

-- Add columns as nullable first for backfill
ALTER TABLE "boards" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "project_id" uuid;--> statement-breakpoint

-- Ensure a default project exists and backfill existing rows to it
INSERT INTO "projects" ("name","subdomain","description")
VALUES ('Default Project','default','Auto-created during migration')
ON CONFLICT ("subdomain") DO NOTHING;--> statement-breakpoint

UPDATE "boards" SET "project_id" = (SELECT "id" FROM "projects" WHERE "subdomain" = 'default')
WHERE "project_id" IS NULL;--> statement-breakpoint

UPDATE "posts" p SET "project_id" = COALESCE(p."project_id", b."project_id")
FROM "boards" b
WHERE p."board_id" = b."id" AND p."project_id" IS NULL;--> statement-breakpoint

UPDATE "comments" c SET "project_id" = COALESCE(c."project_id", p."project_id")
FROM "posts" p
WHERE c."post_id" = p."id" AND c."project_id" IS NULL;--> statement-breakpoint

-- Add constraints after backfill
ALTER TABLE "boards" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "boards" ADD CONSTRAINT "boards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "boards_project_slug_uq" ON "boards" USING btree ("project_id","slug");