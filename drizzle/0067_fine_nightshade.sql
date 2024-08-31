ALTER TABLE "users" ADD COLUMN "studiopresencelocation" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "studiopresenceping" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "state";