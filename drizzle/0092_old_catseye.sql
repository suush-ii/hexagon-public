CREATE TABLE IF NOT EXISTS "gamesessions" (
	"jobid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true,
	"verified" boolean DEFAULT false,
	"placeid" bigint NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"userid" bigint NOT NULL
);
