CREATE TABLE IF NOT EXISTS "assetfavorites" (
	"userid" bigint NOT NULL,
	"assetid" bigint NOT NULL,
	CONSTRAINT "assetfavorites_userid_assetid_pk" PRIMARY KEY("userid","assetid")
);
