import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  numeric,
  serial,
  text,
  timestamp,
  uniqueIndex,
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
    multipleChoiceOptions: integer("multiple_choice_options").notNull(),
    startedAt: timestamp("started_at", { mode: "date" }).notNull(),
    endedAt: timestamp("ended_at", { mode: "date" }).notNull(),
    authorId: varchar("author_id").notNull(),
  },
  (table) => ({ slugIdx: uniqueIndex("slug_idx").on(table.slug) }),
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
  responds: many(studentResponds),
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
  ({ one, many }) => ({
    question: one(questions, {
      fields: [multipleChoices.questionId],
      references: [questions.id],
    }),
    responds: many(studentRespondChoices),
  }),
);

export const essays = myPgTable("essay", {
  iqid: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  question: text("question").notNull(),
  answer: text("correct_answer").notNull(),
  isStrictEqual: boolean("is_strict_equal").default(false).notNull(),
});

export const essayRelations = relations(essays, ({ one, many }) => ({
  question: one(questions, {
    fields: [essays.questionId],
    references: [questions.id],
  }),
  responds: many(studentRespondEssays),
}));

export const studentResponds = myPgTable(
  "studentRespond",
  {
    id: serial("id").primaryKey(),
    checkIn: timestamp("check_in", { mode: "date" }).notNull(),
    submittedAt: timestamp("submittedAt", { mode: "date" }).notNull(),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id),
  },
  (table) => ({
    questionIdx: index("question_idx").on(table.questionId),
    studentIdx: index("student_idx").on(table.studentId),
  }),
);

export const studentRespondRelations = relations(
  studentResponds,
  ({ one, many }) => ({
    question: one(questions, {
      fields: [studentResponds.questionId],
      references: [questions.id],
    }),
    student: one(students, {
      fields: [studentResponds.studentId],
      references: [students.id],
    }),
    essays: many(studentRespondEssays),
    choices: many(studentRespondChoices),
  }),
);

export const studentRespondChoices = myPgTable("studentResponChoice", {
  id: serial("id").primaryKey(),
  respondId: integer("respond_id")
    .notNull()
    .references(() => studentResponds.id),
  choiceId: integer("choice_id")
    .notNull()
    .references(() => multipleChoices.iqid),
  answer: integer("answer").default(0).notNull(),
});

export const studentRespondChoiceRelations = relations(
  studentRespondChoices,
  ({ one }) => ({
    parentRespond: one(studentResponds, {
      fields: [studentRespondChoices.respondId],
      references: [studentResponds.id],
    }),
    choiceQuestion: one(multipleChoices, {
      fields: [studentRespondChoices.choiceId],
      references: [multipleChoices.iqid],
    }),
  }),
);

export const studentRespondEssays = myPgTable("studentRespondEssay", {
  id: serial("id").primaryKey(),
  respondId: integer("respond_id")
    .notNull()
    .references(() => studentResponds.id),
  essayId: integer("essay_id")
    .notNull()
    .references(() => essays.iqid),
  answer: text("answer").notNull(),
  score: numeric("score").notNull(),
});

export const studentRespondEssayRelations = relations(
  studentRespondEssays,
  ({ one }) => ({
    parentRespond: one(studentResponds, {
      fields: [studentRespondEssays.respondId],
      references: [studentResponds.id],
    }),
    essayQuestion: one(essays, {
      fields: [studentRespondEssays.essayId],
      references: [essays.iqid],
    }),
  }),
);

export const studentBlocklists = myPgTable("studentBlocklist", {
  id: serial("id").primaryKey(),
  time: timestamp("time", { mode: "date" }).notNull(),
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

export const studentTemporaryBans = myPgTable(
  "studentTemporaryBan",
  {
    id: serial("id").primaryKey(),
    startedAt: timestamp("started_at", { mode: "date" }).notNull(),
    endedAt: timestamp("ended_at", { mode: "date" }).notNull(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id),
    reason: text("reason").notNull(),
  },
  (table) => ({
    studentIdx: uniqueIndex("uniq_student_id").on(table.studentId),
  }),
);

export const studentTemporaryBanRelations = relations(
  studentTemporaryBans,
  ({ one }) => ({
    student: one(students, {
      fields: [studentTemporaryBans.studentId],
      references: [students.id],
    }),
  }),
);
