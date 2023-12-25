import { and, asc, eq, schema } from "@enpitsu/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  studentProcedure,
} from "../trpc";

export const questionRouter = createTRPCRouter({
  getQuestions: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.questions.findMany({
      orderBy: [asc(schema.questions.title)],
      with: {
        user: {
          columns: {
            name: true,
            image: true,
            email: true,
          },
        },
        allowLists: {
          with: {
            subgrade: {
              with: {
                grade: true,
              },
            },
          },
        },
      },
    }),
  ),

  getSubgradeForAllowList: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.grades.findMany({
      with: {
        subgrades: {
          columns: {
            id: true,
            label: true,
          },
        },
      },
    });
  }),

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

  createQuestion: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(4),
        title: z.string().min(5),
        startedAt: z.date(),
        endedAt: z.date(),
        allowLists: z.array(z.number()).min(1),
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db.transaction(async (tx) => {
          const question = await tx
            .insert(schema.questions)
            .values({
              ...input,
              authorId: ctx.session.user.id,
            })
            .returning({ id: schema.questions.id });

          const id = question.at(0)!.id;

          await tx.transaction(async (tx2) => {
            for (const subgradeId of input.allowLists) {
              await tx2.insert(schema.allowLists).values({
                questionId: id,
                subgradeId,
              });
            }
          });

          return { id };
        }),
    ),

  editParentQuestion: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string().min(4),
        title: z.string().min(5),
        startedAt: z.date(),
        endedAt: z.date(),
        allowLists: z.array(z.number()).min(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        await tx
          .update(schema.questions)
          .set({
            title: input.title,
            slug: input.slug,
            startedAt: input.startedAt,
            endedAt: input.endedAt,
          })
          .where(eq(schema.questions.id, input.id));

        const currentAllowList = await tx.query.allowLists.findMany({
          where: eq(schema.allowLists.questionId, input.id),
        });

        const added = input.allowLists.filter(
          (value) => !currentAllowList.map((l) => l.subgradeId).includes(value),
        );
        const removed = currentAllowList
          .map((l) => l.subgradeId)
          .filter((value) => !input.allowLists.includes(value));

        if (added.length > 0 || removed.length > 0)
          await tx.transaction(async (tx2) => {
            if (added.length > 0)
              for (const newAllow of added) {
                await tx2.insert(schema.allowLists).values({
                  questionId: input.id,
                  subgradeId: newAllow,
                });
              }

            if (removed.length > 0)
              for (const removeAllow of removed) {
                await tx2
                  .delete(schema.allowLists)
                  .where(
                    and(
                      eq(schema.allowLists.questionId, input.id),
                      eq(schema.allowLists.subgradeId, removeAllow),
                    ),
                  );
              }
          });
      }),
    ),

  deleteQuestion: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db.transaction(async (tx) => {
          await tx
            .delete(schema.questions)
            .where(eq(schema.questions.id, input.id));
          await tx
            .delete(schema.allowLists)
            .where(eq(schema.allowLists.questionId, input.id));
        }),
    ),

  // Semi realtime stuff begin from this line
  getMultipleChoices: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.multipleChoices.findMany({
        where: eq(schema.multipleChoices.questionId, input.questionId),
        orderBy: [asc(schema.multipleChoices.iqid)],
      }),
    ),

  getEssays: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.essays.findMany({
        where: eq(schema.essays.questionId, input.questionId),
      }),
    ),
  createChoice: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(schema.multipleChoices)
        .values({
          ...input,
          question: "",
          correctAnswerOrder: 0,
          options: Array.from({ length: 5 }).map((_, idx) => ({
            order: idx + 1,
            answer: "",
          })),
        })
        .returning(),
    ),
  updateChoice: protectedProcedure
    .input(
      z.object({
        iqid: z.number(),
        question: z.string(),
        options: z
          .array(
            z.object({
              order: z.number().min(1).max(5),
              answer: z.string(),
            }),
          )
          .min(5)
          .max(5),

        correctAnswerOrder: z.number(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(schema.multipleChoices)
        .set({
          question: input.question,
          options: input.options,
          correctAnswerOrder: input.correctAnswerOrder,
        })
        .where(eq(schema.multipleChoices.iqid, input.iqid)),
    ),

  deleteChoice: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .delete(schema.multipleChoices)
        .where(eq(schema.multipleChoices.iqid, input.id)),
    ),

  createEssay: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db.insert(schema.essays).values({
        question: "",
        answer: "",
        questionId: input.questionId,
      }),
    ),
  updateEssay: protectedProcedure
    .input(
      z.object({
        iqid: z.number(),
        question: z.string(),
        answer: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(schema.essays)
        .set({
          question: input.question,
          answer: input.answer,
        })
        .where(eq(schema.essays.iqid, input.iqid)),
    ),
  deleteEssay: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(schema.essays).where(eq(schema.essays.iqid, input.id)),
    ),
});
