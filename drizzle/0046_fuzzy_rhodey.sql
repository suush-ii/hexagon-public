ALTER TABLE "assets" ADD COLUMN "onsale" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "assetversions" text[] DEFAULT '{}'::text[];--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "scrubbedassetname" text;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "scrubbedgamename" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "placeversions" text[] DEFAULT '{}'::text[];