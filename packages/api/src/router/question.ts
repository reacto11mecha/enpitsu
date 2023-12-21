import { asc, eq, schema } from "@enpitsu/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const questionRouter = createTRPCRouter({
  getQuestions: protectedProcedure.query(async ({ ctx }) => {
    const questions = await ctx.db.query.questions.findMany({
      orderBy: [asc(schema.questions.title)],
      with: {
        user: {
          columns: {
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    const data = await Promise.all(
      questions.map(async (question) => {
        const rawAllow = await ctx.db.query.allowLists.findMany({
          where: eq(schema.allowLists.questionId, question.id),
          with: {
            subgrade: {
              columns: {
                label: true,
                id: true,
              },
              with: {
                grade: true,
              },
            },
          },
        });

        const allowList = rawAllow.map((allow) => ({
          label: `${allow.subgrade.grade.label} ${allow.subgrade.label}`,
          allowListId: allow.id,
          gradeId: allow.subgrade.grade.id,
          subgradeId: allow.subgradeId,
        }));

        return {
          ...question,
          allowList,
        };
      }),
    );

    return data;
  }),

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

  getQuestion: publicProcedure
    .input(z.object({ slug: z.string().min(2) }))
    .query(() => ({ hello: "world" })),

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
});
