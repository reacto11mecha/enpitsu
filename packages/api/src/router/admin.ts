import { cache } from "@enpitsu/cache";
import { and, eq, not, schema, sql } from "@enpitsu/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  getPendingUser: adminProcedure.query(({ ctx }) =>
    ctx.db.query.users.findMany({
      where: and(
        sql`${schema.users.emailVerified} IS NULL`,
        not(eq(schema.users.id, ctx.session.user.id)),
      ),
    }),
  ),

  rejectPendingUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutate(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const specificUser = await tx.query.users.findFirst({
          where: eq(schema.users.id, input.id),
        });

        if (!specificUser)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pengguna yang dituju tidak ditemukan!",
          });

        if (specificUser.emailVerified)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Pengguna sudah di approve!",
          });

        return tx.delete(schema.users).where(eq(schema.users.id, input.id));
      }),
    ),

  acceptPendingUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.string,
        role: z.enum(["admin", "user"]),
      }),
    )
    .mutate(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        const specificUser = await tx.query.users.findFirst({
          where: eq(schema.users.id, input.id),
        });

        if (!specificUser)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pengguna yang dituju tidak ditemukan!",
          });

        if (specificUser.emailVerified)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Pengguna sudah di approve!",
          });

        return await tx.update(schema.users).set({
          emailVerified: new Date(),
          role: input.role,
        });
      }),
    ),
});
