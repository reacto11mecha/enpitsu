CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "enpitsu_account" (
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "enpitsu_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "enpitsu_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone,
	"role" "role" DEFAULT 'user' NOT NULL,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enpitsu_grade" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_student" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"token" varchar(35) NOT NULL,
	"participant_number" varchar(50) NOT NULL,
	"room" varchar(50) NOT NULL,
	"subgrade_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_subgrade" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(50) NOT NULL,
	"grade_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_allowList" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"subgrade_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_essay" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"question" text NOT NULL,
	"correct_answer" text NOT NULL,
	"is_strict_equal" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_multipleChoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"question" text NOT NULL,
	"options" json NOT NULL,
	"correct_answer" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_question" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"multiple_choice_options" integer NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp NOT NULL,
	"author_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_studentBlocklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"time" timestamp NOT NULL,
	"question_id" integer NOT NULL,
	"student_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_studentResponChoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"respond_id" integer NOT NULL,
	"choice_id" integer NOT NULL,
	"answer" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_studentRespondEssay" (
	"id" serial PRIMARY KEY NOT NULL,
	"respond_id" integer NOT NULL,
	"essay_id" integer NOT NULL,
	"answer" text NOT NULL,
	"score" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_studentRespond" (
	"id" serial PRIMARY KEY NOT NULL,
	"check_in" timestamp NOT NULL,
	"submittedAt" timestamp NOT NULL,
	"question_id" integer NOT NULL,
	"student_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enpitsu_studentTemporaryBan" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp NOT NULL,
	"student_id" integer NOT NULL,
	"reason" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enpitsu_account" ADD CONSTRAINT "enpitsu_account_user_id_enpitsu_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."enpitsu_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_session" ADD CONSTRAINT "enpitsu_session_user_id_enpitsu_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."enpitsu_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_student" ADD CONSTRAINT "enpitsu_student_subgrade_id_enpitsu_subgrade_id_fk" FOREIGN KEY ("subgrade_id") REFERENCES "public"."enpitsu_subgrade"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_allowList" ADD CONSTRAINT "enpitsu_allowList_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."enpitsu_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_allowList" ADD CONSTRAINT "enpitsu_allowList_subgrade_id_enpitsu_subgrade_id_fk" FOREIGN KEY ("subgrade_id") REFERENCES "public"."enpitsu_subgrade"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_essay" ADD CONSTRAINT "enpitsu_essay_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."enpitsu_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_multipleChoice" ADD CONSTRAINT "enpitsu_multipleChoice_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."enpitsu_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_question" ADD CONSTRAINT "enpitsu_question_author_id_enpitsu_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."enpitsu_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentBlocklist" ADD CONSTRAINT "enpitsu_studentBlocklist_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."enpitsu_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentBlocklist" ADD CONSTRAINT "enpitsu_studentBlocklist_student_id_enpitsu_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."enpitsu_student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentResponChoice" ADD CONSTRAINT "enpitsu_studentResponChoice_respond_id_enpitsu_studentRespond_id_fk" FOREIGN KEY ("respond_id") REFERENCES "public"."enpitsu_studentRespond"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentResponChoice" ADD CONSTRAINT "enpitsu_studentResponChoice_choice_id_enpitsu_multipleChoice_id_fk" FOREIGN KEY ("choice_id") REFERENCES "public"."enpitsu_multipleChoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentRespondEssay" ADD CONSTRAINT "enpitsu_studentRespondEssay_respond_id_enpitsu_studentRespond_id_fk" FOREIGN KEY ("respond_id") REFERENCES "public"."enpitsu_studentRespond"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentRespondEssay" ADD CONSTRAINT "enpitsu_studentRespondEssay_essay_id_enpitsu_essay_id_fk" FOREIGN KEY ("essay_id") REFERENCES "public"."enpitsu_essay"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentRespond" ADD CONSTRAINT "enpitsu_studentRespond_question_id_enpitsu_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."enpitsu_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentRespond" ADD CONSTRAINT "enpitsu_studentRespond_student_id_enpitsu_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."enpitsu_student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_studentTemporaryBan" ADD CONSTRAINT "enpitsu_studentTemporaryBan_student_id_enpitsu_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."enpitsu_student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "token_idx" ON "enpitsu_student" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "slug_idx" ON "enpitsu_question" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "question_idx" ON "enpitsu_studentRespond" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "student_idx" ON "enpitsu_studentRespond" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_student_id" ON "enpitsu_studentTemporaryBan" USING btree ("student_id");