CREATE TABLE IF NOT EXISTS "relations" (
	"requestid" bigserial PRIMARY KEY NOT NULL,
	"sender" bigint NOT NULL,
	"recipient" bigint NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"type" text NOT NULL
);
