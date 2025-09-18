ALTER TABLE "post" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "status" SET DEFAULT 'open'::text;--> statement-breakpoint
DROP TYPE "public"."post_status";--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('open', 'planned', 'in_progress', 'done', 'closed');--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "status" SET DEFAULT 'open'::"public"."post_status";--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "status" SET DATA TYPE "public"."post_status" USING "status"::"public"."post_status";