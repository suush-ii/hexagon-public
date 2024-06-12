ALTER TABLE "votes" DROP COLUMN IF EXISTS "voteid";
ALTER TABLE "votes" ADD CONSTRAINT "votes_userid_gameid_pk" PRIMARY KEY("userid","gameid");--> statement-breakpoint