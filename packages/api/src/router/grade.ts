import { eq, schema } from "@enpitsu/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gradeRouter = createTRPCRouter({
  getGrades: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.grades.findMany(),
  ),

  getSubgrades: protectedProcedure
    .input(
      z.object({
        gradeId: z.number(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.subGrades.findMany({
        where: eq(schema.subGrades.gradeId, input.gradeId),
        with: {
          grade: true,
        },
      }),
    ),

  getStudents: protectedProcedure
    .input(z.object({ subgradeId: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.students.findMany({
        where: eq(schema.students.subgradeId, input.subgradeId),
      }),
    ),

  createGrade: protectedProcedure
    .input(z.object({ label: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.grades).values(input);
    }),

  createSubgrade: protectedProcedure
    .input(
      z.object({
        gradeId: z.number(),
        label: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.subGrades).values(input);
    }),

  createStudent: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        participantNumber: z.string(),
        room: z.string(),
        subgradeId: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.students).values(input);
    }),

  updateSubgrade: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        label: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(schema.subGrades)
        .set({ label: input.label })
        .where(eq(schema.subGrades.id, input.id));
    }),

  deleteGrade: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const subgrades = await tx.query.subGrades.findMany({
          where: eq(schema.subGrades.gradeId, input),
        });

        await tx.delete(schema.grades).where(eq(schema.grades.id, input));
        await tx
          .delete(schema.subGrades)
          .where(eq(schema.subGrades.gradeId, input));

        await tx.transaction(async (tx2) => {
          for (const subgrade of subgrades) {
            await tx2
              .delete(schema.students)
              .where(eq(schema.students.subgradeId, subgrade.id));
          }
        });
      });
    }),

  deleteSubgrade: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      return await ctx.db.transaction(async (tx) => {
        await tx.delete(schema.subGrades).where(eq(schema.subGrades.id, input));
        await tx
          .delete(schema.students)
          .where(eq(schema.students.subgradeId, input));
      });
    }),
});
