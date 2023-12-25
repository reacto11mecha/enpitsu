import { and, count, eq, schema } from "@enpitsu/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, studentProcedure } from "../trpc";

export const examRouter = createTRPCRouter({
  getQuestion: studentProcedure
    .input(z.object({ slug: z.string().min(2) }))
    .query(async ({ ctx, input }) => {
      const question = await ctx.db.query.questions.findFirst({
        where: eq(schema.questions.slug, input.slug),
        columns: {
          id: true,
          title: true,
          startedAt: true,
          endedAt: true,
        },
        with: {
          blocklists: {
            columns: {
              studentId: true,
            },
          },
          allowLists: {
            columns: {
              subgradeId: true,
            },
          },
          multipleChoices: {
            orderBy: (choice, { asc }) => [asc(choice.iqid)],
            columns: {
              iqid: true,
              question: true,
              options: true,
            },
          },
          essays: {
            orderBy: (essay, { asc }) => [asc(essay.iqid)],
            columns: {
              iqid: true,
              question: true,
            },
          },
        },
      });

      if (!question)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Soal tidak ditemukan.",
        });

      if (
        question.blocklists.find((block) => block.studentId === ctx.student.id)
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Tidak diizinkan mengerjakan soal. Kemungkinan anda salah mata pelajaran, jika dianggap benar maka informasikan pengawas ruangan.",
        });

      if (
        !question.allowLists.find(
          (list) => list.subgradeId === ctx.student.subgrade.id,
        )
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Tidak diizinkan mengerjakan soal. Kemungkinan anda salah mata pelajaran, jika dianggap benar maka informasikan pengawas ruangan.",
        });

      if (question.startedAt >= new Date())
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Soal ini belum bisa diakses.",
        });

      if (question.endedAt <= new Date())
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Soal ini sudah melewati waktu ujian.",
        });

      return question;
    }),

  storeAnswer: studentProcedure.mutation(() => {
    return { d: "" };
  }),

  storeBlocklist: studentProcedure
    .input(z.object({ questionId: z.number(), studentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const alreadyExist = await ctx.db
        .select({ value: count() })
        .from(schema.studentBlocklists)
        .where(
          and(
            eq(schema.studentBlocklists.questionId, input.questionId),
            eq(schema.studentBlocklists.studentId, input.studentId),
          ),
        );

      if (alreadyExist.at(0)!.value > 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Data kecurangan yang sama sudah terekam sebelumnya.",
        });

      return await ctx.db.insert(schema.studentBlocklists).values(input);
    }),
});
