CREATE TABLE IF NOT EXISTS "votes" (
	"voteid" bigserial PRIMARY KEY NOT NULL,
	"userid" bigint NOT NULL,
	"gameid" bigint NOT NULL,
	"type" text NOT NULL
);
