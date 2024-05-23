import { cache } from "@enpitsu/cache";
import { and, asc, count, desc, eq, schema } from "@enpitsu/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { compareTwoStringLikability } from "../utils";

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
      where:
        ctx.session.user.role !== "admin"
          ? eq(schema.questions.authorId, ctx.session.user.id)
          : undefined,
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

  getStudentBlocklists: adminProcedure.query(({ ctx }) =>
    ctx.db.query.studentBlocklists.findMany({
      columns: {
        id: true,
        time: true,
      },
      orderBy: [desc(schema.studentBlocklists.time)],
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
        orderBy: [desc(schema.studentBlocklists.time)],
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

  getStudentTempobans: adminProcedure.query(({ ctx }) =>
    ctx.db.query.studentTemporaryBans.findMany({
      columns: {
        id: true,
        startedAt: true,
        endedAt: true,
        reason: true,
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

  getStudentAnswers: adminProcedure.query(({ ctx }) =>
    ctx.db.query.studentResponds.findMany({
      columns: {
        id: true,
        checkIn: true,
        submittedAt: true,
      },
      orderBy: [desc(schema.studentResponds.submittedAt)],
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
        orderBy: [desc(schema.studentResponds.submittedAt)],
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
        multipleChoiceOptions: z.number().min(4).max(5),
        startedAt: z.date(),
        endedAt: z.date(),
        allowLists: z.array(z.number()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);
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
        try {
          await tx
            .update(schema.questions)
            .set({
              title: input.title,
              slug: input.slug,
              startedAt: input.startedAt,
              endedAt: input.endedAt,
            })
            .where(eq(schema.questions.id, input.id));
        } catch (e) {
          // @ts-expect-error unknown error value
          if (e.code === "23505" && e.constraint_name === "slug_idx")
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Sudah ada kode soal dengan nama yang sama, mohon di ubah",
            });
          else
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Terjadi kesalahan internal, mohon coba lagi nanti",
            });
        }

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
  getChoicesIdByQuestionId: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .query(async ({ ctx, input }) =>
      ctx.db.query.multipleChoices.findMany({
        where: eq(schema.multipleChoices.questionId, input.questionId),
        orderBy: [asc(schema.multipleChoices.iqid)],
        columns: {
          iqid: true,
        },
      }),
    ),

  getSpecificChoiceQuestion: protectedProcedure
    .input(z.object({ choiceIqid: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.multipleChoices.findFirst({
        where: eq(schema.multipleChoices.iqid, input.choiceIqid),
        columns: {
          iqid: true,
          correctAnswerOrder: true,
          options: true,
          question: true,
        },
      }),
    ),

  updateSpecificChoice: protectedProcedure
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
          .min(4)
          .max(5),

        correctAnswerOrder: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const currentChoiceData = await tx
          .select({
            questionId: schema.multipleChoices.questionId,
          })
          .from(schema.multipleChoices)
          .where(eq(schema.multipleChoices.iqid, input.iqid))
          .for("update");

        if (currentChoiceData.length < 1 || !currentChoiceData?.at(0))
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Soal tidak ditemukan!",
          });

        const parentQuestion = await tx.query.questions.findFirst({
          where: eq(schema.questions.id, currentChoiceData.at(0)!.questionId),
          columns: {
            slug: true,
          },
        });

        try {
          await cache.del(`trpc-get-question-slug-${parentQuestion!.slug}`);
        } catch (_) {
          console.error({
            code: "REDIS_ERR",
            message:
              "Terjadi masalah terhadap konektivitas dengan redis, mohon di cek 🙏💀",
          });
        }

        return await tx
          .update(schema.multipleChoices)
          .set({
            question: input.question,
            options: input.options,
            correctAnswerOrder: input.correctAnswerOrder,
          })
          .where(eq(schema.multipleChoices.iqid, input.iqid));
      }),
    ),

  deleteSpecificChoice: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const currentChoiceData = await tx
          .select({
            questionId: schema.multipleChoices.questionId,
          })
          .from(schema.multipleChoices)
          .where(eq(schema.multipleChoices.iqid, input.id))
          .for("update");

        if (currentChoiceData.length < 1 || !currentChoiceData?.at(0))
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Soal tidak ditemukan!",
          });

        const parentQuestion = await tx.query.questions.findFirst({
          where: eq(schema.questions.id, currentChoiceData.at(0)!.questionId),
          columns: {
            slug: true,
          },
        });

        try {
          await cache.del(`trpc-get-question-slug-${parentQuestion!.slug}`);
        } catch (_) {
          console.error({
            code: "REDIS_ERR",
            message:
              "Terjadi masalah terhadap konektivitas dengan redis, mohon di cek 🙏💀",
          });
        }

        const answerCount = await tx
          .select({ value: count() })
          .from(schema.studentRespondChoices)
          .where(eq(schema.studentRespondChoices.choiceId, input.id));

        if (answerCount.at(0)!.value > 0)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Sudah terdapat jawaban pada soal ini, maka tidak bisa dihapus",
          });

        return await tx
          .delete(schema.multipleChoices)
          .where(eq(schema.multipleChoices.iqid, input.id))
          .returning({ iqid: schema.multipleChoices.iqid });
      }),
    ),

  createNewChoice: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const parentQuestion = await tx.query.questions.findFirst({
          where: eq(schema.questions.id, input.questionId),
          columns: {
            slug: true,
            multipleChoiceOptions: true,
          },
        });

        if (!parentQuestion)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Mata pelajaran dari soal ini tidak ditemukan!",
          });

        try {
          await cache.del(`trpc-get-question-slug-${parentQuestion.slug}`);
        } catch (_) {
          console.error({
            code: "REDIS_ERR",
            message:
              "Terjadi masalah terhadap konektivitas dengan redis, mohon di cek 🙏💀",
          });
        }

        return await tx.insert(schema.multipleChoices).values({
          ...input,
          question: "",
          correctAnswerOrder: 0,
          options: Array.from({
            length: parentQuestion.multipleChoiceOptions,
          }).map((_, idx) => ({
            order: idx + 1,
            answer: "",
          })),
        });
      }),
    ),

  // Essay section
  getEssaysIdByQuestionId: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .query(async ({ ctx, input }) =>
      ctx.db.query.essays.findMany({
        where: eq(schema.essays.questionId, input.questionId),
        orderBy: [asc(schema.essays.iqid)],
        columns: {
          iqid: true,
        },
      }),
    ),

  createNewEssay: protectedProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const currentParentQuestion = await tx
          .select({
            slug: schema.questions.slug,
          })
          .from(schema.questions)
          .where(eq(schema.questions.id, input.questionId))
          .for("update");

        if (currentParentQuestion.length < 1 || !currentParentQuestion?.at(0))
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Gagal membuat soal baru, mata pelajaran tidak ditemukan",
          });

        try {
          await cache.del(
            `trpc-get-question-slug-${currentParentQuestion?.at(0)!.slug}`,
          );
        } catch (_) {
          console.error({
            code: "REDIS_ERR",
            message:
              "Terjadi masalah terhadap konektivitas dengan redis, mohon di cek 🙏💀",
          });
        }

        return await tx.insert(schema.essays).values({
          question: "",
          answer: "",
          questionId: input.questionId,
        });
      }),
    ),

  getSpecificEssayQuestion: protectedProcedure
    .input(z.object({ essayIqid: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.essays.findFirst({
        where: eq(schema.essays.iqid, input.essayIqid),
        columns: {
          answer: true,
          question: true,
          isStrictEqual: true,
        },
      }),
    ),

  updateSpecificEssay: protectedProcedure
    .input(
      z.object({
        iqid: z.number(),
        question: z.string(),
        answer: z.string(),
        isStrictEqual: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const currentEssayData = await tx
          .select({
            questionId: schema.essays.questionId,
          })
          .from(schema.essays)
          .where(eq(schema.essays.iqid, input.iqid))
          .for("update");

        if (currentEssayData.length < 1 || !currentEssayData?.at(0))
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Soal tidak ditemukan!",
          });

        const parentQuestion = await tx.query.questions.findFirst({
          where: eq(schema.questions.id, currentEssayData.at(0)!.questionId),
          columns: {
            slug: true,
          },
        });

        try {
          await cache.del(`trpc-get-question-slug-${parentQuestion!.slug}`);
        } catch (_) {
          console.error({
            code: "REDIS_ERR",
            message:
              "Terjadi masalah terhadap konektivitas dengan redis, mohon di cek 🙏💀",
          });
        }

        return await tx
          .update(schema.essays)
          .set({
            question: input.question,
            answer: input.answer,
            isStrictEqual: input.isStrictEqual,
          })
          .where(eq(schema.essays.iqid, input.iqid));
      }),
    ),

  deleteSpecificEssay: protectedProcedure
    .input(z.object({ essayIqid: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const currentEssayData = await tx
          .select({
            questionId: schema.essays.questionId,
          })
          .from(schema.essays)
          .where(eq(schema.essays.iqid, input.essayIqid))
          .for("update");

        if (currentEssayData.length < 1 || !currentEssayData?.at(0))
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Soal tidak ditemukan!",
          });

        const parentQuestion = await tx.query.questions.findFirst({
          where: eq(schema.questions.id, currentEssayData.at(0)!.questionId),
          columns: {
            slug: true,
          },
        });

        try {
          await cache.del(`trpc-get-question-slug-${parentQuestion!.slug}`);
        } catch (_) {
          console.error({
            code: "REDIS_ERR",
            message:
              "Terjadi masalah terhadap konektivitas dengan redis, mohon di cek 🙏💀",
          });
        }

        return await tx
          .delete(schema.essays)
          .where(eq(schema.essays.iqid, input.essayIqid));
      }),
    ),
  // ended at this line

  // Correction purpose endpoint started from this line below
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

  updateEssayScore: protectedProcedure
    .input(
      z.object({
        score: z.number().min(0).max(1),
        id: z.number(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(schema.studentRespondEssays)
        .set({
          score: input.score.toFixed(5).toString(),
        })
        .where(eq(schema.studentRespondEssays.id, input.id))
        .returning({
          score: schema.studentRespondEssays.score,
        }),
    ),

  recalcEssayScore: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const essaysResponds = await tx.query.studentResponds.findMany({
          where: eq(schema.studentResponds.questionId, input.questionId),
          columns: {},
          with: {
            essays: {
              columns: {
                id: true,
                essayId: true,
                answer: true,
              },
            },
          },
        });

        if (!essaysResponds || essaysResponds.length < 1)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tidak ada jawaban yang disubmit berdasarkan soal ini!",
          });

        if (
          essaysResponds
            .map((e) => e.essays.length)
            .reduce((curr, acc) => curr + acc) < 1
        )
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Jawaban dari peserta tidak ditemukan",
          });

        const essayAnswers = await tx.query.essays.findMany({
          where: eq(schema.essays.questionId, input.questionId),
          columns: {
            iqid: true,
            answer: true,
            isStrictEqual: true,
          },
        });

        // This condition would not likely to happen, like,
        // this case scenario is really impossible thanks
        // to relational database like postgresql
        if (!essayAnswers || essayAnswers.length < 1)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tidak ada soal dari jawaban ini!",
          });

        await tx.transaction(async (tx2) => {
          for (const responses of essaysResponds) {
            for (const essay of responses.essays) {
              const answerBase = essayAnswers.find(
                (e) => e.iqid === essay.essayId,
              );

              // This thing too
              if (!answerBase)
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message:
                    "Terdapat jawaban yang tidak memiliki soal, tidak akan bisa di update",
                });

              const updatedScore = compareTwoStringLikability(
                answerBase.isStrictEqual,
                answerBase.answer.trim(),
                essay.answer.trim(),
              );

              await tx2
                .update(schema.studentRespondEssays)
                .set({
                  score: updatedScore,
                })
                .where(eq(schema.studentRespondEssays.essayId, essay.essayId));
            }
          }
        });
      }),
    ),

  downloadStudentResponsesExcelAggregate: protectedProcedure.mutation(
    async ({ ctx }) => {
      const responsesByQID = await ctx.db.query.studentResponds.findMany({
        columns: {
          checkIn: true,
          submittedAt: true,
        },
        with: {
          question: {
            columns: {
              slug: true,
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

          choices: {
            columns: {
              choiceId: true,
              answer: true,
            },
            with: {
              choiceQuestion: {
                columns: {
                  correctAnswerOrder: true,
                },
              },
            },
          },

          essays: {
            columns: {
              id: true,
              score: true,
            },
          },
        },
      });

      if (responsesByQID.length < 1)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Belum ada jawaban pada aplikasi ini!",
        });

      const normalizedData = responsesByQID.map((response) => ({
        slug: response.question.slug,
        name: response.student.name,
        className: `${response.student.subgrade.grade.label} ${response.student.subgrade.label}`,
        room: response.student.room,
        checkIn: response.checkIn,
        submittedAt: response.submittedAt,
        choiceRightAnswered: response.choices
          .map(
            (choice) =>
              choice.answer === choice.choiceQuestion.correctAnswerOrder,
          )
          .filter((a) => !!a).length,
        choiceLength: response.choices.length,
        essayScore: response.essays
          .map((e) => parseFloat(e.score))
          .reduce((curr, acc) => curr + acc, 0),
        essayLength: response.essays.length,
      }));

      const sortedData = [...new Set(normalizedData.map((d) => d.slug))].map(
        (slug) => {
          const answers = normalizedData.filter((d) => d.slug === slug);

          const sortedByClass = [...new Set(answers.map((d) => d.className))]
            .sort((l, r) => l.localeCompare(r))
            .flatMap((cn) =>
              answers
                .filter((a) => a.className === cn)
                .sort((l, r) => l.name.localeCompare(r.name)),
            )
            .map(({ slug: _, ...rest }) => rest);

          return {
            slug,
            data: sortedByClass,
          };
        },
      );

      return sortedData;
    },
  ),

  downloadStudentResponsesExcelById: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const specificQuestion = await ctx.db.query.questions.findFirst({
        where: eq(schema.questions.id, input.questionId),
        columns: {
          title: true,
          slug: true,
        },
        with: {
          multipleChoices: {
            columns: {
              iqid: true,
              correctAnswerOrder: true,
            },
          },
          essays: {
            columns: {
              iqid: true,
            },
          },
        },
      });

      if (!specificQuestion)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tidak ada soal yang sesuai dengan permintaan anda!",
        });

      const responsesByQID = await ctx.db.query.studentResponds.findMany({
        where: eq(schema.studentResponds.questionId, input.questionId),
        columns: {
          checkIn: true,
          submittedAt: true,
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

          choices: {
            columns: {
              choiceId: true,
              answer: true,
            },
          },

          essays: {
            columns: {
              id: true,
              score: true,
            },
          },
        },
      });

      if (responsesByQID.length < 1)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Belum ada jawaban pada soal ini!",
        });

      const normalizedData = responsesByQID.map((response) => ({
        name: response.student.name,
        className: `${response.student.subgrade.grade.label} ${response.student.subgrade.label}`,
        room: response.student.room,
        checkIn: response.checkIn,
        submittedAt: response.submittedAt,
        choiceRightAnswered: specificQuestion.multipleChoices
          .map((choice) => {
            const currentChoice = response.choices.find(
              (c) => c.choiceId === choice.iqid,
            );

            if (!currentChoice) return false;

            return currentChoice.answer === choice.correctAnswerOrder;
          })
          .filter((a) => !!a).length,
        essayScore: response.essays
          .map((e) => parseFloat(e.score))
          .reduce((curr, acc) => curr + acc, 0),
      }));

      const sortedData = [...new Set(normalizedData.map((d) => d.className))]
        .sort((l, r) => l.localeCompare(r))
        .flatMap((className) =>
          normalizedData
            .filter((data) => data.className === className)
            .sort((l, r) => l.name.localeCompare(r.name)),
        );

      return {
        title: specificQuestion.title,
        slug: specificQuestion.slug,
        choiceLength: specificQuestion.multipleChoices.length,
        essayLength: specificQuestion.essays.length,
        data: sortedData,
      };
    }),
});
