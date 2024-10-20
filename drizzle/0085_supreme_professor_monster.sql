ALTER TABLE "assets" ALTER COLUMN "genres" SET DEFAULT '{"All"}';--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "original" boolean DEFAULT false NOT NULL;