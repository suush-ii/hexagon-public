ALTER TABLE "assets" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "updated" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "places" ALTER COLUMN "created" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "places" ALTER COLUMN "updated" SET DEFAULT now();