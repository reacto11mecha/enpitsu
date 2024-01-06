import { cache } from "@enpitsu/cache";
import { and, asc, eq, schema } from "@enpitsu/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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
        multipleChoices: {
          columns: {
            iqid: true,
          },
        },
        essays: {
          columns: {
            iqid: true,
          },
        },
      },
    }),
  ),

  getSubgradeForAllowList: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.grades.findMany({
      with: {
        subgrades: {
          columns: {
            id: true,
            label: true,
          },
        },
      },
    }),
  ),

  getStudentBlocklists: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.studentBlocklists.findMany({
      columns: {
        id: true,
        time: true,
      },
      with: {
        student: {
          columns: {
            name: true,
            room: true,
          },
          with: {
            subgrade: {
              columns: {
                id: true,
                label: true,
              },
              with: {
                grade: {
                  columns: {
                    id: true,
                    label: true,
                  },
                },
              },
            },
          },
        },
        question: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ),

  getStudentBlocklistByQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.studentBlocklists.findMany({
        where: eq(schema.studentBlocklists.questionId, input.questionId),
        columns: {
          id: true,
          time: true,
        },
        with: {
          student: {
            columns: {
              name: true,
              room: true,
            },
            with: {
              subgrade: {
                columns: {
                  id: true,
                  label: true,
                },
                with: {
                  grade: {
                    columns: {
                      id: true,
                      label: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ),

  getStudentAnswers: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.studentResponds.findMany({
      columns: {
        id: true,
        checkIn: true,
        submittedAt: true,
      },
      with: {
        question: {
          columns: {
            id: true,
            title: true,
          },
        },
        student: {
          columns: {
            name: true,
            room: true,
          },
          with: {
            subgrade: {
              columns: {
                id: true,
                label: true,
              },
              with: {
                grade: {
                  columns: {
                    id: true,
                    label: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ),

  getStudentAnswersByQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.studentResponds.findMany({
        where: eq(schema.studentResponds.questionId, input.questionId),
        columns: {
          id: true,
          checkIn: true,
          submittedAt: true,
        },
        with: {
          question: {
            columns: {
              id: true,
              title: true,
            },
          },
          student: {
            columns: {
              name: true,
              room: true,
            },
            with: {
              subgrade: {
                columns: {
                  id: true,
                  label: true,
                },
                with: {
                  grade: {
                    columns: {
                      id: true,
                      label: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ),

  deleteSpecificAnswer: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        await tx
          .delete(schema.studentRespondChoices)
          .where(eq(schema.studentRespondChoices.respondId, input.id));

        await tx
          .delete(schema.studentRespondEssays)
          .where(eq(schema.studentRespondEssays.respondId, input.id));

        await tx
          .delete(schema.studentResponds)
          .where(eq(schema.studentResponds.id, input.id));
      }),
    ),

  deleteSpecificBlocklist: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .delete(schema.studentBlocklists)
        .where(eq(schema.studentBlocklists.id, input.id)),
    ),

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
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction(async (tx) => {
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
        });
      } catch (e) {
        // @ts-expect-error unknown error value
        if (e.code === "23505" && e.constraint_name === "slug_idx")
          throw new TRPCError({
            code: "CONFLICT",
            message: "Sudah ada kode soal dengan nama yang sama, mohon di ubah",
          });
        else
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Terjadi kesalahan internal, mohon coba lagi nanti",
          });
      }
    }),

  getQuestionForEdit: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.questions.findFirst({
        where: eq(schema.questions.id, input.id),
        with: {
          allowLists: {
            columns: {
              subgradeId: true,
            },
          },
        },
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

        try {
          await cache.del(`trpc-get-question-slug-${input.slug}`);
        } catch (_) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Terjadi masalah terhadap konektivitas sistem cache",
          });
        }
      }),
    ),

  deleteQuestion: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db.transaction(async (tx) => {
          const currentQuestion = await tx.query.questions.findFirst({
            where: eq(schema.questions.id, input.id),
            columns: {
              slug: true,
            },
            with: {
              responds: {
                columns: {
                  id: true,
                },
              },
            },
          });

          if (!currentQuestion)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Soal tidak dtemukan!",
            });

          await tx
            .delete(schema.allowLists)
            .where(eq(schema.allowLists.questionId, input.id));
          await tx
            .delete(schema.studentBlocklists)
            .where(eq(schema.studentBlocklists.questionId, input.id));
          await tx
            .delete(schema.multipleChoices)
            .where(eq(schema.multipleChoices.questionId, input.id));
          await tx
            .delete(schema.essays)
            .where(eq(schema.essays.questionId, input.id));

          await tx.transaction(async (tx2) => {
            for (const respond of currentQuestion.responds) {
              await tx2
                .delete(schema.studentResponds)
                .where(eq(schema.studentResponds.id, respond.id));
              await tx2
                .delete(schema.studentRespondChoices)
                .where(eq(schema.studentRespondChoices.respondId, respond.id));
              await tx2
                .delete(schema.studentRespondEssays)
                .where(eq(schema.studentRespondEssays.respondId, respond.id));
            }
          });

          await tx
            .delete(schema.questions)
            .where(eq(schema.questions.id, input.id));

          try {
            await cache.del(`trpc-get-question-slug-${currentQuestion.slug}`);
          } catch (_) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Terjadi masalah terhadap konektivitas sistem cache",
            });
          }
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
    .mutation(async ({ ctx, input }) => {
      try {
        const cacheKeys = await cache.keys("trpc-get-question-slug:*");
        if (cacheKeys.length > 0) await cache.del(cacheKeys);
      } catch (_) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi masalah terhadap konektivitas sistem cache",
        });
      }

      return await ctx.db
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
        .returning();
    }),
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
    .mutation(async ({ ctx, input }) => {
      try {
        const cacheKeys = await cache.keys("trpc-get-question-slug:*");
        if (cacheKeys.length > 0) await cache.del(cacheKeys);
      } catch (_) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi masalah terhadap konektivitas sistem cache",
        });
      }

      return await ctx.db
        .update(schema.multipleChoices)
        .set({
          question: input.question,
          options: input.options,
          correctAnswerOrder: input.correctAnswerOrder,
        })
        .where(eq(schema.multipleChoices.iqid, input.iqid))
        .returning();
    }),

  deleteChoice: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const cacheKeys = await cache.keys("trpc-get-question-slug:*");
        if (cacheKeys.length > 0) await cache.del(cacheKeys);
      } catch (_) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi masalah terhadap konektivitas sistem cache",
        });
      }

      return await ctx.db
        .delete(schema.multipleChoices)
        .where(eq(schema.multipleChoices.iqid, input.id))
        .returning({ iqid: schema.multipleChoices.iqid });
    }),

  createEssay: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const cacheKeys = await cache.keys("trpc-get-question-slug:*");
        if (cacheKeys.length > 0) await cache.del(cacheKeys);
      } catch (_) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi masalah terhadap konektivitas sistem cache",
        });
      }

      return await ctx.db
        .insert(schema.essays)
        .values({
          question: "",
          answer: "",
          questionId: input.questionId,
        })
        .returning();
    }),
  updateEssay: protectedProcedure
    .input(
      z.object({
        iqid: z.number(),
        question: z.string(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const cacheKeys = await cache.keys("trpc-get-question-slug:*");
        if (cacheKeys.length > 0) await cache.del(cacheKeys);
      } catch (_) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi masalah terhadap konektivitas sistem cache",
        });
      }

      return await ctx.db
        .update(schema.essays)
        .set({
          question: input.question,
          answer: input.answer,
        })
        .where(eq(schema.essays.iqid, input.iqid));
    }),
  deleteEssay: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const cacheKeys = await cache.keys("trpc-get-question-slug:*");
        if (cacheKeys.length > 0) await cache.del(cacheKeys);
      } catch (_) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi masalah terhadap konektivitas sistem cache",
        });
      }

      return await ctx.db
        .delete(schema.essays)
        .where(eq(schema.essays.iqid, input.id))
        .returning({ iqid: schema.essays.iqid });
    }),
  // ended at this line

  // Correction purpose endpoint started from this line below
  getEssaysScore: protectedProcedure
    .input(z.object({ respondId: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.studentRespondEssays.findMany({
        where: eq(schema.studentRespondEssays.respondId, input.respondId),
        columns: {
          id: true,
          essayId: true,
          score: true,
        },
      }),
    ),
});
