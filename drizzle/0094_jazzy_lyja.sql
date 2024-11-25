CREATE TABLE IF NOT EXISTS "logs" (
	"jobid" uuid NOT NULL,
	"time" timestamp with time zone DEFAULT now() NOT NULL,
	"log" text NOT NULL,
	"userid" bigint NOT NULL,
	CONSTRAINT "logs_jobid_time_pk" PRIMARY KEY("jobid","time")
);
