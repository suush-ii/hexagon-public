CREATE TABLE IF NOT EXISTS "privatesellers" (
	"userid" bigint NOT NULL,
	"assetid" bigint NOT NULL,
	"inventoryid" integer NOT NULL,
	"price" integer NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "privatesellers_userid_assetid_inventoryid_pk" PRIMARY KEY("userid","assetid","inventoryid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saleshistory" (
	"userid" bigint NOT NULL,
	"assetid" bigint NOT NULL,
	"inventoryid" integer NOT NULL,
	"price" integer NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"currentaverageprice" integer NOT NULL,
	CONSTRAINT "saleshistory_userid_assetid_inventoryid_pk" PRIMARY KEY("userid","assetid","inventoryid")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "recentaverageprice" integer;