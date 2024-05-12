ALTER TABLE "places" ADD COLUMN "allowedgear" text[] DEFAULT '{}' ;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "geargenreenforced" boolean DEFAULT false NOT NULL;