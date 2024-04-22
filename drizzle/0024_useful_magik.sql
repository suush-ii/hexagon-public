CREATE TABLE IF NOT EXISTS "adminlogs" (
	"logid" bigserial PRIMARY KEY NOT NULL,
	"userid" bigint NOT NULL,
	"associatedid" bigint NOT NULL,
	"associatedidtype" text NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"action" text NOT NULL,
	"banlength" text,
	"newrole" text
);
