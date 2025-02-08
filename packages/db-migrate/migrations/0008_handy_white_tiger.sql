ALTER TABLE "enpitsu_account" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "enpitsu_account" RENAME COLUMN "providerAccountId" TO "provider_account_id";--> statement-breakpoint
ALTER TABLE "enpitsu_session" RENAME COLUMN "sessionToken" TO "session_token";--> statement-breakpoint
ALTER TABLE "enpitsu_session" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "enpitsu_user" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
DROP INDEX "acc_userId_idx";--> statement-breakpoint
DROP INDEX "sess_userId_idx";--> statement-breakpoint
ALTER TABLE "enpitsu_account" DROP CONSTRAINT "enpitsu_account_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "enpitsu_account" ALTER COLUMN "access_token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "enpitsu_session" ALTER COLUMN "expires" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enpitsu_user" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "enpitsu_user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "enpitsu_question" ALTER COLUMN "author_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "enpitsu_account" ADD CONSTRAINT "enpitsu_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id");--> statement-breakpoint
ALTER TABLE "enpitsu_account" ADD CONSTRAINT "enpitsu_account_user_id_enpitsu_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."enpitsu_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_session" ADD CONSTRAINT "enpitsu_session_user_id_enpitsu_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."enpitsu_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enpitsu_question" ADD CONSTRAINT "enpitsu_question_author_id_enpitsu_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."enpitsu_user"("id") ON DELETE cascade ON UPDATE no action;