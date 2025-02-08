import { relations } from "drizzle-orm";
import { pgEnum, primaryKey } from "drizzle-orm/pg-core";

import { myPgTable } from "./_table";
import { questions } from "./question";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const users = myPgTable("user", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }),
  email: t.varchar({ length: 255 }).notNull(),
  emailVerified: t.timestamp({ mode: "date", withTimezone: true }),
  role: roleEnum("role").default("user").notNull(),
  image: t.varchar({ length: 255 }),
}));

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  questions: many(questions),
}));

export const accounts = myPgTable(
  "account",
  (t) => ({
    userId: t
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: t
      .varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: t.varchar({ length: 255 }).notNull(),
    providerAccountId: t.varchar({ length: 255 }).notNull(),
    refresh_token: t.varchar({ length: 255 }),
    access_token: t.text(),
    expires_at: t.integer(),
    token_type: t.varchar({ length: 255 }),
    scope: t.varchar({ length: 255 }),
    id_token: t.text(),
    session_state: t.varchar({ length: 255 }),
  }),
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = myPgTable("session", (t) => ({
  sessionToken: t.varchar({ length: 255 }).notNull().primaryKey(),
  userId: t
    .uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
