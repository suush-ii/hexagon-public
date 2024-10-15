ALTER TABLE "saleshistory" DROP CONSTRAINT "saleshistory_userid_assetid_inventoryid_pk";--> statement-breakpoint
ALTER TABLE "saleshistory" ADD COLUMN "saleshistoryid" bigserial PRIMARY KEY NOT NULL;