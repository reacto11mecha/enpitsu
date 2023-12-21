import { asc, schema } from "@enpitsu/db";
// import { DateTime } from "luxon";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const questionRouter = createTRPCRouter({
  getQuestions: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.questions.findMany({
      orderBy: [asc(schema.questions.title)],
    }),
  ),
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
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db
          .insert(schema.questions)
          .values({
            ...input,
            authorId: ctx.session.user.id,
          })
          .returning({ id: schema.questions.id }),
    ),
});
