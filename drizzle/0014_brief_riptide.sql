ALTER TABLE "games" ALTER COLUMN "serversize" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "port" integer DEFAULT 0;