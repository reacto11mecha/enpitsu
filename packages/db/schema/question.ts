import { relations } from "drizzle-orm";
import {
  index,
  integer,
  json,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { myPgTable } from "./_table";
import { users } from "./auth";
import { students, subGrades } from "./grade";

export const questions = myPgTable(
  "question",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    startedAt: timestamp("started_at", { mode: "date" }).notNull(),
    endedAt: timestamp("ended_at", { mode: "date" }).notNull(),
    authorId: varchar("author_id").notNull(),
  },
  (table) => ({ slugIdx: index("slug_idx").on(table.slug) }),
);

export const questionRelations = relations(questions, ({ one, many }) => ({
  allowLists: many(allowLists),
  user: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
  multipleChoices: many(multipleChoices),
  essays: many(essays),
  blocklists: many(studentBlocklists),
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

export const multipleChoices = myPgTable("multipleChoice", {
  iqid: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  question: text("question").notNull(),
  options: json("options")
    .$type<{ order: number; answer: string }[]>()
    .notNull(),
  correctAnswerOrder: integer("correct_answer").notNull(),
});

export const multipleChoiceRelations = relations(
  multipleChoices,
  ({ one }) => ({
    question: one(questions, {
      fields: [multipleChoices.questionId],
      references: [questions.id],
    }),
  }),
);

export const essays = myPgTable("essay", {
  iqid: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  question: text("question").notNull(),
  answer: text("correct_answer").notNull(),
});

export const essayRelations = relations(essays, ({ one }) => ({
  question: one(questions, {
    fields: [essays.questionId],
    references: [questions.id],
  }),
}));

// TODO: create a more proper table to store student responds
export const studentResponds = myPgTable("studentRespond", {
  id: serial("id").primaryKey(),
});

export const studentBlocklists = myPgTable("studentBlocklist", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
});

export const studentBlocklistRelations = relations(
  studentBlocklists,
  ({ one }) => ({
    question: one(questions, {
      fields: [studentBlocklists.questionId],
      references: [questions.id],
    }),
    student: one(students, {
      fields: [studentBlocklists.studentId],
      references: [students.id],
    }),
  }),
);
