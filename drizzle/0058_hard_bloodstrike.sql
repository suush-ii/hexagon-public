CREATE TABLE IF NOT EXISTS "persistence" (
	"placeid" bigint NOT NULL,
	"key" text NOT NULL,
	"type" text NOT NULL,
	"scope" text NOT NULL,
	"target" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "persistence_placeid_target_scope_pk" PRIMARY KEY("placeid","target","scope")
);
