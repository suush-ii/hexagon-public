UPDATE "users" SET "blurb" = '' WHERE "blurb" IS NULL;

ALTER TABLE "users" ALTER COLUMN "blurb" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "blurb" SET NOT NULL;