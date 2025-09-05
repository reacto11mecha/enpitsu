CREATE TABLE "enpitsu_yjsDocument" (
	"name" varchar(255) NOT NULL,
	"data" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enpitsu_essay" ADD COLUMN "isQuestionEmpty" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "enpitsu_multipleChoice" ADD COLUMN "isQuestionEmpty" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "nameIdx" ON "enpitsu_yjsDocument" USING btree ("name");