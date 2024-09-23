CREATE TABLE IF NOT EXISTS "applications" (
	"applicationid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questions" json[],
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed" timestamp with time zone,
	"revieweruserid" bigint,
	"accepted" boolean,
	"discordid" text,
	"verificationsequence" text NOT NULL
);
