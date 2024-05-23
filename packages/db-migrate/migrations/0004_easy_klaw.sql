CREATE TABLE IF NOT EXISTS "enpitsu_studentTemporaryBan" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp NOT NULL,
	"student_id" integer NOT NULL,
	"reason" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentTemporaryBan" ADD CONSTRAINT "enpitsu_studentTemporaryBan_student_id_enpitsu_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "enpitsu_student"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
