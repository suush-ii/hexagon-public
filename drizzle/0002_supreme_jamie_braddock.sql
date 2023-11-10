CREATE TABLE IF NOT EXISTS "assets" (
	"assetid" bigserial PRIMARY KEY NOT NULL,
	"assetname" text NOT NULL,
	"assettype" text NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"creatoruserid" bigint NOT NULL,
	"moderationstate" text NOT NULL,
	"simpleasseturl" text
);
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "gameid" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "places" ALTER COLUMN "universeid" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN IF EXISTS "created";