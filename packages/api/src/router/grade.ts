import { asc, eq, schema } from "@enpitsu/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const gradeRouter = createTRPCRouter({
  getGrades: adminProcedure.query(({ ctx }) => ctx.db.query.grades.findMany()),

  getSubgrades: adminProcedure
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
        orderBy: [asc(schema.subGrades.label)],
      }),
    ),

  getStudents: adminProcedure
    .input(z.object({ subgradeId: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.students.findMany({
        where: eq(schema.students.subgradeId, input.subgradeId),
        orderBy: [asc(schema.students.name)],
      }),
    ),

  getSubgrade: adminProcedure.input(z.number()).query(({ ctx, input }) =>
    ctx.db.query.subGrades.findFirst({
      where: eq(schema.subGrades.id, input),
    }),
  ),

  createGrade: adminProcedure
    .input(z.object({ label: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.grades).values(input);
    }),

  createSubgrade: adminProcedure
    .input(
      z.object({
        gradeId: z.number(),
        label: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.subGrades).values(input);
    }),

  createStudent: adminProcedure
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

  createStudentMany: adminProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          participantNumber: z.string(),
          room: z.string(),
          subgradeId: z.number(),
        }),
      ),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.students).values(input);
    }),

  updateSubgrade: adminProcedure
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

  updateStudent: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        participantNumber: z.string(),
        room: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(schema.students)
        .set({
          name: input.name,
          participantNumber: input.participantNumber,
          room: input.room,
        })
        .where(eq(schema.students.id, input.id));
    }),

  deleteGrade: adminProcedure
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
            await tx2
              .delete(schema.allowLists)
              .where(eq(schema.allowLists.subgradeId, subgrade.id));
          }
        });
      });
    }),

  deleteSubgrade: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        await tx.delete(schema.subGrades).where(eq(schema.subGrades.id, input));
        await tx
          .delete(schema.students)
          .where(eq(schema.students.subgradeId, input));
        await tx
          .delete(schema.allowLists)
          .where(eq(schema.allowLists.subgradeId, input));
      });
    }),

  deleteStudent: adminProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(schema.students)
        .where(eq(schema.students.id, input));
    }),

  downloadSpecificGradeExcel: adminProcedure
    .input(z.object({ gradeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const gradesData = await ctx.db.query.grades.findFirst({
        where: eq(schema.grades.id, input.gradeId),
        columns: {
          label: true,
        },
        with: {
          subgrades: {
            columns: {
              label: true,
            },
            with: {
              students: {
                columns: {
                  name: true,
                  token: true,
                  participantNumber: true,
                  room: true,
                },
              },
            },
          },
        },
      });

      if (!gradesData)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Data yang anda cari tidak ditemukan!",
        });

      if (gradesData.subgrades.length < 1)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Belum ada data kelas pada angkatan ini!",
        });

      return gradesData;
    }),
});
