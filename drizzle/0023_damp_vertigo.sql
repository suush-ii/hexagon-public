CREATE TABLE IF NOT EXISTS "favorites" (
	"userid" bigint NOT NULL,
	"assetid" bigint PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory" (
	"inventoryid" bigserial PRIMARY KEY NOT NULL,
	"userid" bigint NOT NULL,
	"itemid" bigint NOT NULL,
	"wearing" boolean NOT NULL,
	"obatineddate" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"transactionid" bigserial PRIMARY KEY NOT NULL,
	"userid" bigint NOT NULL,
	"itemid" bigint,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"amount" bigint NOT NULL,
	"sourceuserid" bigint
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "laststipend" timestamp with time zone DEFAULT now() NOT NULL;