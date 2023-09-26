CREATE TABLE IF NOT EXISTS "config" (
	"maintenanceenabled" boolean PRIMARY KEY DEFAULT false NOT NULL,
	"registrationenabled" boolean DEFAULT true NOT NULL,
	"keysenabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "keys" (
	"key" text PRIMARY KEY NOT NULL,
	"keyid" serial NOT NULL,
	"madeby" text NOT NULL,
	"claimedby" text,
	"expires" timestamp NOT NULL,
	"useable" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_key" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"hashed_password" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_session" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"active_expires" bigint NOT NULL,
	"idle_expires" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"userid" serial NOT NULL,
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"coins" bigint NOT NULL,
	"discordid" integer,
	"joindate" timestamp NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_key" ADD CONSTRAINT "user_key_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
