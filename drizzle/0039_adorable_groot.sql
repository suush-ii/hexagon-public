ALTER TABLE "assets" ADD COLUMN "topunish" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "punished" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bans" ADD COLUMN "offensivecontent" text;--> statement-breakpoint
ALTER TABLE "bans" ADD COLUMN "offensiveassetid" bigint;