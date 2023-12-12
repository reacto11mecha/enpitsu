import { eq, schema } from "@enpitsu/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gradeRouter = createTRPCRouter({
  getGrades: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.grades.findMany(),
  ),


  getSubrades: protectedProcedure.input(z.object({
    id: z.number()
  })).query(({ ctx }) =>
    ctx.db.query.subGrades.findMany({
      where: eq(schema.subGrades.gradeId, input.id)
    }),
  ),

  createGrade: protectedProcedure
    .input(z.object({ label: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.grades).values(input);
    }),

  deleteGrade: protectedProcedure
    .input(z.number())
    .mutation(({ ctx, input }) => {
      return ctx.db.delete(schema.grades).where(eq(schema.grades.id, input));
    }),

  createSubGrade: protectedProcedure
    .input(
      z.object({
        gradeId: z.number(),
        label: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.subGrades).values(input);
    }),

  deleteSubgrade: protectedProcedure
    .input(z.number())
    .mutation(({ ctx, input }) => {
      return ctx.db
        .delete(schema.subGrades)
        .where(eq(schema.subGrades.id, input));
    }),
});
