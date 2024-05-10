CREATE TABLE IF NOT EXISTS "bans" (
	"banid" bigserial PRIMARY KEY NOT NULL,
	"banlength" text,
	"action" text NOT NULL,
	"expiration" timestamp with time zone NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"userid" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "registerip" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lastip" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banid" bigint;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "blurb" text;