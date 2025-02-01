import type { TRPCRouterRecord } from "@trpc/server";

import { cache } from "@enpitsu/cache";
import {eq} from "@enpitsu/db"
import {
  preparedQuestionSelect,
  preparedStudentHasAnswered,
  preparedStudentIsCheated,
  preparedStudentIsTemporarilyBanned,
} from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema"
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { studentProcedure } from "../trpc";
import type { TStudent } from "../trpc";
import { compareTwoStringLikability } from "../utils";

type TQuestion = NonNullable<
  Awaited<ReturnType<typeof preparedQuestionSelect.execute>>
>;

const getQuestionPrecheck = async (student: TStudent, question: TQuestion) => {
  const { allowLists, ...sendedData } = question;

  const isTemporarilyBanned = await preparedStudentIsTemporarilyBanned.execute({
    studentId: student.id,
  });

  if (isTemporarilyBanned) {
    const nowTime = new Date();

    if (
      (isTemporarilyBanned.startedAt <= nowTime,
      isTemporarilyBanned.endedAt >= nowTime)
    )
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Anda dilarang mengerjakan soal apapun. Alasan: ${isTemporarilyBanned.reason}`,
      });
  }

  const isCheated = await preparedStudentIsCheated.execute({
    questionId: question.id,
    studentId: student.id,
  });

  if (isCheated)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Anda sudah melakukan kecurangan, data kecurangan sudah direkam dan anda tidak bisa lagi mengerjakan soal ini.",
    });

  const alreadyHasAnswer = await preparedStudentHasAnswered.execute({
    questionId: question.id,
    studentId: student.id,
  });

  if (alreadyHasAnswer)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Anda sudah mengerjakan soal ini!",
    });

  if (!allowLists.find((list) => list.subgradeId === student.subgrade.id))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Tidak diizinkan mengerjakan soal, kemungkinan anda salah mata pelajaran. Jika seharusnya anda bisa mengerjakan maka informasikan pengawas ruangan.",
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

export const examRouter = {
  getStudent: studentProcedure.query(({ ctx }) => ({ student: ctx.student })),

  getQuestion: studentProcedure
    .input(z.object({ slug: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const cachedQuestion = await cache.get(
          `trpc-get-question-slug-${input.slug}`,
        );

        if (cachedQuestion) {
          const question = JSON.parse(cachedQuestion) as TQuestion;

          const sendedData = await getQuestionPrecheck(ctx.student, question);

          return sendedData;
        }
      } catch (error) {
        console.error(
          JSON.stringify({
            time: Date.now().valueOf(),
            msg: "Failed to get cached question data, fallback to database request",
            ...input,
          }),
        );
        console.error(error);
      }

      const question = await preparedQuestionSelect.execute(input);

      if (!question)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Soal tidak ditemukan.",
        });

      const sendedData = await getQuestionPrecheck(ctx.student, question);

      try {
        await cache.set(
          `trpc-get-question-slug-${input.slug}`,
          JSON.stringify(question),
          "EX",
          25 * 10,
        );
      } catch (_) {
        console.error(
          JSON.stringify({
            time: Date.now().valueOf(),
            msg: "Failed to set cache question data, continuing without cache write",
            endpoint: "exam.getQuestion",
            studentToken: ctx.studentToken,
            ...input,
          }),
        );
      }

      return sendedData;
    }),

  queryQuestion: studentProcedure
    .input(z.object({ slug: z.string().min(2) }))
    .query(async ({ ctx, input }) => {
      try {
        const cachedQuestion = await cache.get(
          `trpc-get-question-slug-${input.slug}`,
        );

        if (cachedQuestion) {
          const question = JSON.parse(cachedQuestion) as TQuestion;

          const sendedData = await getQuestionPrecheck(ctx.student, question);

          return sendedData;
        }
      } catch (error) {
        console.error(
          JSON.stringify({
            time: Date.now().valueOf(),
            endpoint: "exam.queryQuestion",
            msg: "Failed to get cached question data, fallback to database request",
            input,
          }),
        );
        console.error(error);
      }

      const question = await preparedQuestionSelect.execute(input);

      if (!question)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Soal tidak ditemukan.",
        });

      const sendedData = await getQuestionPrecheck(ctx.student, question);

      try {
        await cache.set(
          `trpc-get-question-slug-${input.slug}`,
          JSON.stringify(question),
          "EX",

          // 2 hours
          2 * 60 * 60,
        );
      } catch (_) {
        console.error(
          JSON.stringify({
            time: Date.now().valueOf(),
            msg: "Failed to set cache question data, continuing without cache write",
            endpoint: "exam.queryQuestion",
            studentToken: ctx.studentToken,
            input,
          }),
        );
      }

      return sendedData;
    }),

  submitAnswer: studentProcedure
    .input(
      z.object({
        questionId: z.number(),
        checkIn: z.date(),
        submittedAt: z.date(),
        multipleChoices: z.array(
          z.object({
            iqid: z.number(),
            choosedAnswer: z.number().min(1),
          }),
        ),

        essays: z.array(
          z.object({
            iqid: z.number(),
            answer: z.string().min(1),
          }),
        ),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const question = await tx.query.questions.findFirst({
          where: eq(schema.questions.id, input.questionId),
        });

        if (!question)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Soal tidak ditemukan.",
          });

        if (question.startedAt >= new Date())
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Soal ini belum bisa diakses, belum bisa mengumpulkan jawaban.",
          });

        if (question.endedAt <= new Date())
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Soal ini sudah melewati waktu ujian, tidak bisa mengumpulkan jawaban lagi.",
          });

        const isCheated = await preparedStudentIsCheated.execute({
          questionId: input.questionId,
          studentId: ctx.student.id,
        });

        if (isCheated)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Tidak bisa mengumpulkan jawaban, anda sudah melakukan kecurangan.",
          });

        const alreadyHasAnswer = await preparedStudentHasAnswered.execute({
          questionId: input.questionId,
          studentId: ctx.student.id,
        });

        if (alreadyHasAnswer)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Tidak bisa mengumpulkan jawaban, anda sudah mengerjakan soal ini.",
          });

        const newRespond = await tx
          .insert(schema.studentResponds)
          .values({
            questionId: question.id,
            studentId: ctx.student.id,
            checkIn: input.checkIn,
            submittedAt: input.submittedAt,
          })
          .returning({ id: schema.studentResponds.id });

        const { id: respondId } = newRespond.at(0)!;

        await tx.transaction(async (tx2) => {
          if (input.multipleChoices.length > 0) {
            for (const choiceRespond of input.multipleChoices) {
              await tx2.insert(schema.studentRespondChoices).values({
                respondId,
                choiceId: choiceRespond.iqid,
                answer: choiceRespond.choosedAnswer,
              });
            }
          }
        });

        await tx.transaction(async (tx2) => {
          if (input.essays.length > 0) {
            for (const essayRespond of input.essays) {
              const essayAnswer = await tx2.query.essays.findFirst({
                where: eq(schema.essays.iqid, essayRespond.iqid),
              });

              if (!essayAnswer)
                throw new TRPCError({
                  code: "NOT_IMPLEMENTED",
                  message:
                    "Terjadi kesalahan, ada soal esay yang sudah dihapus secara tidak sengaja. Refresh halaman ini dan submit supaya dapat melanjutkan proses submit.",
                });

              const score = compareTwoStringLikability(
                essayAnswer.isStrictEqual,
                essayAnswer.answer.trim(),
                essayRespond.answer.trim(),
              );

              await tx2.insert(schema.studentRespondEssays).values({
                respondId,
                essayId: essayRespond.iqid,
                answer: essayRespond.answer.trim(),
                score,
              });
            }
          }
        });
      }),
    ),

  storeBlocklist: studentProcedure
    .input(z.object({ questionId: z.number(), time: z.date() }))
    .mutation(async ({ ctx, input }) => {
      const isCheated = await preparedStudentIsCheated.execute({
        questionId: input.questionId,
        studentId: ctx.student.id,
      });

      if (isCheated)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Data kecurangan yang sama sudah terekam sebelumnya.",
        });

      return await ctx.db
        .insert(schema.studentBlocklists)
        .values({ ...input, studentId: ctx.student.id });
    }),
} satisfies TRPCRouterRecord;
