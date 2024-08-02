CREATE TABLE IF NOT EXISTS "assetthumbnailcache" (
	"assetid" bigint PRIMARY KEY NOT NULL,
	"filehash" text
);
--> statement-breakpoint
ALTER TABLE "outfits" ADD COLUMN "ownerid" bigint;