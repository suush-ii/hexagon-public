CREATE TABLE IF NOT EXISTS "clanitems" (
	"clan" text,
	"awardid" bigint NOT NULL,
	CONSTRAINT "clanitems_clan_awardid_pk" PRIMARY KEY("clan","awardid"),
	CONSTRAINT "clanitems_clan_unique" UNIQUE("clan")
);
