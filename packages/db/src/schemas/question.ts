import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "../auth-schema";
import { student, subGrade } from "./grade";

export const eligibleStatus = pgEnum("eligible", [
  "ELIGIBLE",
  "PROCESSING",
  "NOT_ELIGIBLE",
]);

export const question = pgTable(
  "question",
  (t) => ({
    id: t.serial().primaryKey(),
    slug: t.varchar({ length: 50 }).notNull(),
    title: t.varchar({ length: 255 }).notNull(),
    multipleChoiceOptions: t.integer().notNull(),
    startedAt: t.timestamp({ mode: "date" }).notNull(),
    endedAt: t.timestamp({ mode: "date" }).notNull(),
    eligible: eligibleStatus().notNull().default("NOT_ELIGIBLE"),
    detailedNotEligible: t
      .json()
      .$type<
        { type: "choice" | "essay"; iqid: number; errorMessage: string }[]
      >(),
    notEligibleReason: t
      .text()
      .notNull()
      .default("Soal masih kosong, mohon isi soal terlebih dahulu"),
    authorId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [uniqueIndex("slug_idx").on(table.slug)],
);

export const questionRelations = relations(question, ({ one, many }) => ({
  allowLists: many(allowList),
  user: one(user, {
    fields: [question.authorId],
    references: [user.id],
  }),
  multipleChoices: many(multipleChoice),
  essays: many(essay),
  blocklists: many(studentBlocklist),
  responds: many(studentResponse),
}));

export const allowList = pgTable("allowList", (t) => ({
  id: t.serial().primaryKey(),
  questionId: t
    .integer()
    .notNull()
    .references(() => question.id, { onDelete: "cascade" }),
  subgradeId: t
    .integer()
    .notNull()
    .references(() => subGrade.id, { onDelete: "cascade" }),
}));

export const allowListRelations = relations(allowList, ({ one }) => ({
  question: one(question, {
    fields: [allowList.questionId],
    references: [question.id],
  }),
  subgrade: one(subGrade, {
    fields: [allowList.subgradeId],
    references: [subGrade.id],
  }),
}));

export const multipleChoice = pgTable("multipleChoice", (t) => ({
  iqid: t.serial().primaryKey(),
  questionId: t
    .integer()
    .notNull()
    .references(() => question.id),
  question: t.text().notNull(),
  options: t.json().$type<{ order: number; answer: string }[]>().notNull(),
  correctAnswerOrder: t.integer().notNull(),
}));

export const multipleChoiceRelations = relations(
  multipleChoice,
  ({ one, many }) => ({
    question: one(question, {
      fields: [multipleChoice.questionId],
      references: [question.id],
    }),
    responds: many(studentResponseChoices),
  }),
);

export const essay = pgTable("essay", (t) => ({
  iqid: t.serial().primaryKey(),
  questionId: t
    .integer()
    .notNull()
    .references(() => question.id),
  question: t.text().notNull(),
  answer: t.text().notNull(),
  isStrictEqual: t.boolean().default(false).notNull(),
}));

export const essayRelations = relations(essay, ({ one, many }) => ({
  question: one(question, {
    fields: [essay.questionId],
    references: [question.id],
  }),
  responds: many(studentResponseEssay),
}));

export const studentResponse = pgTable(
  "studentResponse",
  (t) => ({
    id: t.serial().primaryKey(),
    checkIn: t.timestamp({ mode: "date" }).notNull(),
    submittedAt: t.timestamp({ mode: "date" }).notNull(),
    questionId: t
      .integer()
      .notNull()
      .references(() => question.id),
    studentId: t
      .integer("student_id")
      .notNull()
      .references(() => student.id),
  }),
  (table) => [index().on(table.questionId), index().on(table.studentId)],
);

export const studentResponseRelations = relations(
  studentResponse,
  ({ one, many }) => ({
    question: one(question, {
      fields: [studentResponse.questionId],
      references: [question.id],
    }),
    student: one(student, {
      fields: [studentResponse.studentId],
      references: [student.id],
    }),
    essays: many(studentResponseEssay),
    choices: many(studentResponseChoices),
  }),
);

export const studentResponseChoices = pgTable("studentResponseChoice", (t) => ({
  id: t.serial().primaryKey(),
  respondId: t
    .integer()
    .notNull()
    .references(() => studentResponse.id),
  choiceId: t
    .integer()
    .notNull()
    .references(() => multipleChoice.iqid),
  answer: t.integer().default(0).notNull(),
}));

export const studentResponseChoiceRelations = relations(
  studentResponseChoices,
  ({ one }) => ({
    parentRespond: one(studentResponse, {
      fields: [studentResponseChoices.respondId],
      references: [studentResponse.id],
    }),
    choiceQuestion: one(multipleChoice, {
      fields: [studentResponseChoices.choiceId],
      references: [multipleChoice.iqid],
    }),
  }),
);

export const studentResponseEssay = pgTable("studentResponseEssay", (t) => ({
  id: t.serial().primaryKey(),
  respondId: t
    .integer()
    .notNull()
    .references(() => studentResponse.id),
  essayId: t
    .integer()
    .notNull()
    .references(() => essay.iqid),
  answer: t.text().notNull(),
  score: t.numeric().notNull(),
}));

export const studentResponseEssayRelations = relations(
  studentResponseEssay,
  ({ one }) => ({
    parentRespond: one(studentResponse, {
      fields: [studentResponseEssay.respondId],
      references: [studentResponse.id],
    }),
    essayQuestion: one(essay, {
      fields: [studentResponseEssay.essayId],
      references: [essay.iqid],
    }),
  }),
);

export const studentBlocklist = pgTable("studentBlocklist", (t) => ({
  id: t.serial().primaryKey(),
  time: t.timestamp({ mode: "date" }).notNull(),
  questionId: t
    .integer("question_id")
    .notNull()
    .references(() => question.id),
  studentId: t
    .integer()
    .notNull()
    .references(() => student.id),
}));

export const studentBlocklistRelations = relations(
  studentBlocklist,
  ({ one }) => ({
    question: one(question, {
      fields: [studentBlocklist.questionId],
      references: [question.id],
    }),
    student: one(student, {
      fields: [studentBlocklist.studentId],
      references: [student.id],
    }),
  }),
);

export const studentTemporaryBan = pgTable(
  "studentTemporaryBan",
  (t) => ({
    id: t.serial().primaryKey(),
    startedAt: t.timestamp({ mode: "date" }).notNull(),
    endedAt: t.timestamp({ mode: "date" }).notNull(),
    studentId: t
      .integer()
      .notNull()
      .references(() => student.id),
    reason: t.text().notNull(),
  }),
  (table) => [uniqueIndex().on(table.studentId)],
);

export const studentTemporaryBanRelations = relations(
  studentTemporaryBan,
  ({ one }) => ({
    student: one(student, {
      fields: [studentTemporaryBan.studentId],
      references: [student.id],
    }),
  }),
);
