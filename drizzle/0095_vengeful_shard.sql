ALTER TABLE "jobs" ADD COLUMN "presenceping" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "closed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "toevict" bigint[] DEFAULT '{}'::bigint[];