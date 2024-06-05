CREATE TABLE IF NOT EXISTS "legacypersistence" (
	"persistenceid" bigserial PRIMARY KEY NOT NULL,
	"placeid" bigint NOT NULL,
	"userid" bigint NOT NULL,
	"data" text NOT NULL
);
