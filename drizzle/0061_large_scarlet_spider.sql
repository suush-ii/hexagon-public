ALTER TABLE "assets" ALTER COLUMN "genres" SET DEFAULT '{"All"}'::text[];--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "placename" text;