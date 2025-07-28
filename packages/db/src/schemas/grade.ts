import { relations } from "drizzle-orm";
import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import { allowList, studentBlocklist, studentResponse } from "./question";

export const grade = pgTable("grade", (t) => ({
  id: t.serial().primaryKey(),
  label: t.varchar({ length: 50 }).notNull(),
}));

export const gradeRelations = relations(grade, ({ many }) => ({
  subgrade: many(subGrade),
}));

export const subGrade = pgTable("subgrade", (t) => ({
  id: t.serial().primaryKey(),
  label: t.varchar({ length: 50 }).notNull(),
  gradeId: t
    .integer()
    .notNull()
    .references(() => grade.id, { onDelete: "cascade" }),
}));

export const subgradeRelations = relations(subGrade, ({ one, many }) => ({
  grade: one(grade, {
    fields: [subGrade.gradeId],
    references: [grade.id],
  }),
  student: many(student),
  allowList: many(allowList),
}));

export const student = pgTable(
  "student",
  (t) => ({
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 255 }).notNull(),
    token: t.varchar({ length: 35 }).notNull(),
    participantNumber: t.varchar({ length: 50 }).notNull(),
    room: t.varchar({ length: 50 }).notNull(),
    subgradeId: t
      .integer()
      .notNull()
      .references(() => subGrade.id, { onDelete: "cascade" }),
  }),
  (table) => ({ tokenIdx: uniqueIndex().on(table.token) }),
);

export const studentRelations = relations(student, ({ one, many }) => ({
  subgrade: one(subGrade, {
    fields: [student.subgradeId],
    references: [subGrade.id],
  }),
  blocklists: many(studentBlocklist),
  responds: many(studentResponse),
}));
