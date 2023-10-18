CREATE TABLE IF NOT EXISTS "config" (
	"maintenanceenabled" boolean PRIMARY KEY DEFAULT false NOT NULL,
	"registrationenabled" boolean DEFAULT true NOT NULL,
	"keysenabled" boolean DEFAULT false NOT NULL,
	"pageclicker" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"gameid" bigserial PRIMARY KEY NOT NULL,
	"universeid" bigserial NOT NULL,
	"gamename" text NOT NULL,
	"creatoruserid" bigint NOT NULL,
	"active" bigint NOT NULL,
	"visits" bigint NOT NULL,
	"serversize" integer,
	"created" timestamp with time zone NOT NULL,
	"updated" timestamp with time zone NOT NULL,
	"genre" text NOT NULL,
	CONSTRAINT "games_universeid_unique" UNIQUE("universeid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "places" (
	"gameid" bigserial PRIMARY KEY NOT NULL,
	"universeid" bigserial NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"updated" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "keys" (
	"key" text PRIMARY KEY NOT NULL,
	"keyid" serial NOT NULL,
	"madeby" text NOT NULL,
	"claimedby" text,
	"expires" timestamp with time zone NOT NULL,
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
	"userid" bigserial NOT NULL,
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"coins" bigint NOT NULL,
	"discordid" integer,
	"joindate" timestamp with time zone NOT NULL,
	"role" text NOT NULL,
	"state" text DEFAULT 'offline' NOT NULL,
	"lastactivetime" timestamp with time zone DEFAULT now() NOT NULL,
	"avatarheadshot" text,
	"avatarbody" text,
	"avatarobj" text,
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
