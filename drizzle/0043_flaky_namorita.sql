ALTER TABLE "keys" ALTER COLUMN "madeby" TYPE bigint USING "madeby"::bigint;--> statement-breakpoint
ALTER TABLE "keys" ALTER COLUMN "claimedby" TYPE bigint USING "claimedby"::bigint;--> statement-breakpoint
ALTER TABLE "keys" ALTER COLUMN "claimedby" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "created" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "keys" DROP COLUMN IF EXISTS "keyid";--> statement-breakpoint
ALTER TABLE "keys" DROP COLUMN IF EXISTS "madebyuserid";