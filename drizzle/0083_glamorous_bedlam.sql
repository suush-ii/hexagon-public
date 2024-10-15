CREATE TABLE IF NOT EXISTS "trades" (
	"requestid" bigserial PRIMARY KEY NOT NULL,
	"senderid" bigint NOT NULL,
	"recipient" bigint NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"offering" bigint[] NOT NULL,
	"requesting" bigint[] NOT NULL,
	"offeringmoons" integer NOT NULL,
	"requestingmoons" integer NOT NULL
);
