// import { nanoid } from "@enpitsu/token-generator";
import { relations } from "drizzle-orm";
import { integer, serial, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { myPgTable } from "./_table";
import { allowLists, studentBlocklists, studentResponds } from "./question";

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
  allowLists: many(allowLists),
}));

export const students = myPgTable(
  "student",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    token: varchar("token", { length: 35 }).notNull(),
    participantNumber: varchar("participant_number", { length: 50 }).notNull(),
    room: varchar("room", { length: 50 }).notNull(),
    subgradeId: integer("subgrade_id")
      .notNull()
      .references(() => subGrades.id, { onDelete: "cascade" }),
  },
  (table) => ({ tokenIdx: uniqueIndex("token_idx").on(table.token) }),
);

export const studentsRelations = relations(students, ({ one, many }) => ({
  subgrade: one(subGrades, {
    fields: [students.subgradeId],
    references: [subGrades.id],
  }),
  blocklists: many(studentBlocklists),
  responds: many(studentResponds),
}));
