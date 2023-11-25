ALTER TABLE "jobs" ALTER COLUMN "jobid" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "gamesenabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "developEnabled" boolean DEFAULT true NOT NULL;