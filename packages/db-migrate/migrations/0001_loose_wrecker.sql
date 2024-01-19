DROP INDEX IF EXISTS "userId_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "acc_userId_idx" ON "enpitsu_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sess_userId_idx" ON "enpitsu_session" ("userId");