ALTER TABLE "games" ADD COLUMN "likes" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "dislikes" bigint DEFAULT 0 NOT NULL;