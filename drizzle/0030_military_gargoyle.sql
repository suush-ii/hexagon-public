ALTER TABLE "assets" ADD COLUMN "genres" text[] DEFAULT '{"All"}' NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "gearattributes" text[];