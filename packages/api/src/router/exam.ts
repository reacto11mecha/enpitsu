import { cache } from "@enpitsu/cache";
import {
  preparedBlocklistGetCount,
  preparedQuestionSelect,
  schema,
} from "@enpitsu/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, studentProcedure } from "../trpc";
import type { TStudent } from "../trpc";

type TQuestion = NonNullable<
  Awaited<ReturnType<typeof preparedQuestionSelect.execute>>
>;

const getQuestionPrecheck = async (student: TStudent, question: TQuestion) => {
  const { allowLists, ...sendedData } = question;

  const cheatedCount = await preparedBlocklistGetCount.execute({
    questionId: question.id,
    studentId: student.id,
  });

  if (cheatedCount.at(0)!.value > 0)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Anda sudah melakukan kecurangan, data kecurangan sudah direkam.",
    });

  if (!allowLists.find((list) => list.subgradeId === student.subgrade.id))
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

  return sendedData;
};

export const examRouter = createTRPCRouter({
  getStudent: studentProcedure.query(({ ctx }) => ({ student: ctx.student })),

  getQuestion: studentProcedure
    .input(z.object({ slug: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      const cachedQuestion = await cache.get(
        `trpc-get-question-slug-${input.slug}`,
      );

      if (cachedQuestion) {
        const question = JSON.parse(cachedQuestion) as TQuestion;

        const sendedData = await getQuestionPrecheck(ctx.student, question);

        return sendedData;
      }

      const question = await preparedQuestionSelect.execute(input);

      if (!question)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Soal tidak ditemukan.",
        });

      const sendedData = await getQuestionPrecheck(ctx.student, question);

      await cache.set(
        `trpc-get-question-slug-${input.slug}`,
        JSON.stringify(question),
        "EX",
        5 * 10,
      );

      return sendedData;
    }),

  storeAnswer: studentProcedure.mutation(() => {
    return { d: "" };
  }),

  storeBlocklist: studentProcedure
    .input(z.object({ questionId: z.number(), studentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const count = await preparedBlocklistGetCount.execute(input);

      if (count.at(0)!.value > 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Data kecurangan yang sama sudah terekam sebelumnya.",
        });

      return await ctx.db.insert(schema.studentBlocklists).values(input);
    }),
});
