import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { myPgTable } from "./_table";

export const grades = myPgTable("grade", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  label: varchar("label", { length: 50 }).notNull(),
});

export const gradesRelations = relations(grades, ({ many }) => ({
  subgrades: many(subGrades),
}));

export const subGrades = myPgTable("subgrade", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  label: varchar("label", { length: 50 }).notNull(),
  gradeId: integer("grade_id").notNull(),
});

export const subgradesRelations = relations(subGrades, ({ one }) => ({
  grade: one(grades, {
    field: [subGrades.gradeId],
    references: [grades.id],
  }),
}));
