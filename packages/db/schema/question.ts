import { relations } from "drizzle-orm";
import {
  index,
  integer,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { myPgTable } from "./_table";
import { users } from "./auth";

export const questions = myPgTable(
  "question",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 50 }).notNull(),
    title: varchar("slug", { length: 255 }).notNull(),
    startedAt: timestamp("started_at", { mode: "string" }).notNull(),
    endedAt: timestamp("ended_at", { mode: "string" }).notNull(),
    authorId: integer("author_id").notNull(),
  },
  (table) => ({ slugIdx: index("slug_idx").on(table.slug) }),
);

export const allowLists = myPgTable("allowList", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
});

export const allowListRelations = relations(allowLists, ({ one }) => ({
  question: one(questions, {
    fields: [allowLists.questionId],
    references: [questions.id],
  }),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  questions: many(questions),
  user: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
}));
