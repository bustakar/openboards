ALTER TABLE "vote" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "created_by_user_id" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "created_by_visitor_id" text;--> statement-breakpoint
ALTER TABLE "vote" ADD COLUMN "anonymous_id" text;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_status_idx" ON "post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "post_visitor_idx" ON "post" USING btree ("created_by_visitor_id");--> statement-breakpoint
CREATE INDEX "vote_anon_idx" ON "vote" USING btree ("anonymous_id");--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_post_anon_unique" UNIQUE("post_id","anonymous_id");