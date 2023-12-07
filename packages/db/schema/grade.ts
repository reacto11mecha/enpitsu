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

export const subgradesRelations = relations(subGrades, ({ one }) => ({
  grade: one(grades, {
    fields: [subGrades.gradeId],
    references: [grades.id],
  }),
}));
