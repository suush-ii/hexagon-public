CREATE TABLE IF NOT EXISTS "points" (
	"userid" bigint NOT NULL,
	"placeid" bigint NOT NULL,
	"amount" bigint NOT NULL,
	CONSTRAINT "points_userid_placeid_pk" PRIMARY KEY("userid","placeid")
);
