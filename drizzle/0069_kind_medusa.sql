CREATE TABLE IF NOT EXISTS "assetversioncache" (
	"assetversionid" bigint PRIMARY KEY NOT NULL,
	"assettypeid" integer DEFAULT 0 NOT NULL,
	"filehash" text
);
