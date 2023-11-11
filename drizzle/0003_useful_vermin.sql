ALTER TABLE "places" RENAME COLUMN "gameid" TO "placeid";--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "active" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "visits" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "serversize" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "description" text NOT NULL;