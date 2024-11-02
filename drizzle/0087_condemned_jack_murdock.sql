CREATE TABLE IF NOT EXISTS "eventitems" (
	"badgeid" bigint NOT NULL,
	"awardid" bigint NOT NULL,
	CONSTRAINT "eventitems_badgeid_awardid_pk" PRIMARY KEY("badgeid","awardid")
);
