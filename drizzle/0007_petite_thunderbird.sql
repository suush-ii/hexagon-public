ALTER TABLE "games" DROP COLUMN IF EXISTS "gameid";--> statement-breakpoint
ALTER TABLE "games" ADD PRIMARY KEY ("universeid");--> statement-breakpoint
ALTER TABLE "places" ALTER COLUMN "placeid" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "startplace" boolean DEFAULT false NOT NULL;