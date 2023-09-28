ALTER TABLE "config" ALTER COLUMN "pageclicker" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";