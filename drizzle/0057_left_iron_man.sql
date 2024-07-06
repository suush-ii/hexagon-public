CREATE TABLE IF NOT EXISTS "assetversions" (
	"assetid" bigint NOT NULL,
	"filehash" text,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assetversions_assetid_time_pk" PRIMARY KEY("assetid","time")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "macaddresses" (
	"userid" bigint NOT NULL,
	"macaddress" text NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "macaddresses_userid_macaddress_pk" PRIMARY KEY("userid","macaddress")
);
