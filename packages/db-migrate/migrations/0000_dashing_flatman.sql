DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('admin', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"access_token" varchar(255),
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT enpitsu_account_provider_providerAccountId_pk PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp,
	"role" "role" DEFAULT 'user' NOT NULL,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_grade" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_student" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"token" varchar(35),
	"participant_number" varchar(50) NOT NULL,
	"room" varchar(50) NOT NULL,
	"subgrade_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_subgrade" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(50) NOT NULL,
	"grade_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_allowList" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"subgrade_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_essay" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"question" text NOT NULL,
	"correct_answer" text NOT NULL,
	"is_strict_equal" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_multipleChoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"question" text NOT NULL,
	"options" json NOT NULL,
	"correct_answer" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_question" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp NOT NULL,
	"author_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_studentBlocklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"time" timestamp NOT NULL,
	"question_id" integer NOT NULL,
	"student_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_studentResponChoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"respond_id" integer NOT NULL,
	"choice_id" integer NOT NULL,
	"answer" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_studentRespondEssay" (
	"id" serial PRIMARY KEY NOT NULL,
	"respond_id" integer NOT NULL,
	"essay_id" integer NOT NULL,
	"answer" text NOT NULL,
	"score" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enpitsu_studentRespond" (
	"id" serial PRIMARY KEY NOT NULL,
	"check_in" timestamp NOT NULL,
	"submittedAt" timestamp NOT NULL,
	"question_id" integer NOT NULL,
	"student_id" integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "userId_idx" ON "enpitsu_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "userId_idx" ON "enpitsu_session" ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "token_idx" ON "enpitsu_student" ("token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "slug_idx" ON "enpitsu_question" ("slug");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_student" ADD CONSTRAINT "enpitsu_student_subgrade_id_enpitsu_subgrade_id_fk" FOREIGN KEY ("subgrade_id") REFERENCES "enpitsu_subgrade"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_allowList" ADD CONSTRAINT "enpitsu_allowList_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "enpitsu_question"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_allowList" ADD CONSTRAINT "enpitsu_allowList_subgrade_id_enpitsu_subgrade_id_fk" FOREIGN KEY ("subgrade_id") REFERENCES "enpitsu_subgrade"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_essay" ADD CONSTRAINT "enpitsu_essay_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "enpitsu_question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_multipleChoice" ADD CONSTRAINT "enpitsu_multipleChoice_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "enpitsu_question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentBlocklist" ADD CONSTRAINT "enpitsu_studentBlocklist_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "enpitsu_question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentBlocklist" ADD CONSTRAINT "enpitsu_studentBlocklist_student_id_enpitsu_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "enpitsu_student"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentResponChoice" ADD CONSTRAINT "enpitsu_studentResponChoice_respond_id_enpitsu_studentRespond_id_fk" FOREIGN KEY ("respond_id") REFERENCES "enpitsu_studentRespond"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentResponChoice" ADD CONSTRAINT "enpitsu_studentResponChoice_choice_id_enpitsu_multipleChoice_id_fk" FOREIGN KEY ("choice_id") REFERENCES "enpitsu_multipleChoice"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentRespondEssay" ADD CONSTRAINT "enpitsu_studentRespondEssay_respond_id_enpitsu_studentRespond_id_fk" FOREIGN KEY ("respond_id") REFERENCES "enpitsu_studentRespond"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentRespondEssay" ADD CONSTRAINT "enpitsu_studentRespondEssay_essay_id_enpitsu_essay_id_fk" FOREIGN KEY ("essay_id") REFERENCES "enpitsu_essay"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentRespond" ADD CONSTRAINT "enpitsu_studentRespond_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "enpitsu_question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enpitsu_studentRespond" ADD CONSTRAINT "enpitsu_studentRespond_student_id_enpitsu_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "enpitsu_student"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
