ALTER TABLE "projects" ADD COLUMN "custom_domain" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "custom_domain_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "custom_domain_checked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_custom_domain_unique" UNIQUE("custom_domain");