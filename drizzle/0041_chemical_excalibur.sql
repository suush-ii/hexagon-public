CREATE TABLE IF NOT EXISTS "recentlyplayed" (
	"recentlyplayedid" bigserial PRIMARY KEY NOT NULL,
	"userid" bigint NOT NULL,
	"gameid" bigint NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL
);
