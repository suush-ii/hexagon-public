ALTER TABLE "assets" ADD COLUMN "lastweekreset" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "last7dayscounter" bigint DEFAULT 0 NOT NULL;