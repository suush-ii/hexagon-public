ALTER TABLE "outfits" ADD COLUMN "avatarbody" text;--> statement-breakpoint
ALTER TABLE "outfits" ADD COLUMN "outfitname" text;--> statement-breakpoint
ALTER TABLE "outfits" ADD COLUMN "created" timestamp with time zone DEFAULT now() NOT NULL;