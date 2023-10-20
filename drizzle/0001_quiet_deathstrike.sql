CREATE TABLE IF NOT EXISTS "jobs" (
	"jobid" uuid PRIMARY KEY NOT NULL,
	"placeid" bigint,
	"universeid" bigint,
	"type" text NOT NULL,
	"clientversion" text NOT NULL,
	"created" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "placeurl" text;--> statement-breakpoint
ALTER TABLE "keys" ADD COLUMN "madebyuserid" bigserial NOT NULL;