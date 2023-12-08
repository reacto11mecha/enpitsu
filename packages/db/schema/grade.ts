import { relations } from "drizzle-orm";
import { integer, serial, varchar } from "drizzle-orm/pg-core";

import { myPgTable } from "./_table";

export const grades = myPgTable("grade", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 50 }).notNull(),
});

export const gradesRelations = relations(grades, ({ many }) => ({
  subgrades: many(subGrades),
}));

export const subGrades = myPgTable("subgrade", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 50 }).notNull(),
  gradeId: integer("grade_id").notNull(),
});

export const subgradesRelations = relations(subGrades, ({ one, many }) => ({
  grade: one(grades, {
    fields: [subGrades.gradeId],
    references: [grades.id],
  }),
  students: many(students),
}));

export const students = myPgTable("student", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  token: varchar("token", { length: 35 }).$defaultFn(() => "kjsdsd"),
  participantNumber: varchar("participant_number", { length: 50 }).notNull(),
  room: varchar("room", { length: 50 }).notNull(),
  subgradeId: integer("subgrade_id")
    .notNull()
    .references(() => subGrades.id),
});

export const studentsRelations = relations(students, ({ one }) => ({
  subgrade: one(subGrades, {
    fields: [students.subgradeId],
    references: [subGrades.id],
  }),
}));
