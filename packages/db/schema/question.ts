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
import { subGrades } from "./grade";

export const questions = myPgTable(
  "question",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    startedAt: timestamp("started_at", { mode: "string" }).notNull(),
    endedAt: timestamp("ended_at", { mode: "string" }).notNull(),
    authorId: varchar("author_id").notNull(),
  },
  (table) => ({ slugIdx: index("slug_idx").on(table.slug) }),
);

export const questionRelations = relations(questions, ({ one, many }) => ({
  questions: many(allowLists),
  user: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
}));

export const allowLists = myPgTable("allowList", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  subgradeId: integer("subgrade_id")
    .notNull()
    .references(() => subGrades.id, { onDelete: "cascade" }),
});

export const allowListRelations = relations(allowLists, ({ one }) => ({
  question: one(questions, {
    fields: [allowLists.questionId],
    references: [questions.id],
  }),
  subgrade: one(subGrades, {
    fields: [allowLists.subgradeId],
    references: [subGrades.id],
  }),
}));
