import { asc, eq, schema } from "@enpitsu/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const questionRouter = createTRPCRouter({
  getQuestions: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.questions.findMany(),
  ),
  getQuestion: publicProcedure
    .input(z.object({ slug: z.string().min(2) }))
    .query(() => ({ hello: "world" })),

  createQuestion: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(2),
        title: z.string().min(3),
        startedAt: z.string(),
        endedAt: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(schema.questions)
        .values({ ...input, authorId: parseInt(ctx.session.user.id) });
    }),
});
