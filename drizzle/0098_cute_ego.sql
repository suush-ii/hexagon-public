ALTER TABLE "assetcache" ADD COLUMN "expiration" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "assetcache" ADD COLUMN "token" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "assetversioncache" ADD COLUMN "expiration" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "assetversioncache" ADD COLUMN "token" text DEFAULT '' NOT NULL;