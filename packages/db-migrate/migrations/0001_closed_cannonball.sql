CREATE TYPE "public"."eligible" AS ENUM('ELIGIBLE', 'PROCESSING', 'NOT_ELIGIBLE');--> statement-breakpoint
ALTER TABLE "enpitsu_question" ALTER COLUMN "eligible" SET DATA TYPE eligible;--> statement-breakpoint
ALTER TABLE "enpitsu_question" ALTER COLUMN "eligible" SET DEFAULT 'NOT_ELIGIBLE';