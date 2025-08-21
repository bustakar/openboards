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
-- Add columns (nullable); user will assign projects explicitly later
ALTER TABLE "boards" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "project_id" uuid;--> statement-breakpoint

-- Add foreign keys (nullable FKs are permitted)
ALTER TABLE "boards" ADD CONSTRAINT "boards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "boards_project_slug_uq" ON "boards" USING btree ("project_id","slug");