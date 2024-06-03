ALTER TABLE "games" ADD COLUMN "iconid" bigint;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "thumbnailid" bigint;--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN IF EXISTS "iconurl";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN IF EXISTS "thumbnailurl";