CREATE TABLE "vote" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vote_post_user_unique" UNIQUE("post_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vote_org_idx" ON "vote" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "vote_post_idx" ON "vote" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "vote_user_idx" ON "vote" USING btree ("user_id");