CREATE TABLE IF NOT EXISTS "outfits" (
	"outfitid" bigserial PRIMARY KEY NOT NULL,
	"assets" bigint[] NOT NULL,
	"associatedpackageid" bigint,
	"headcolor" smallint,
	"leftarmcolor" smallint,
	"leftlegcolor" smallint,
	"rightarmcolor" smallint,
	"rightlegcolor" smallint,
	"torsocolor" smallint
);
