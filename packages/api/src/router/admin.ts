import { cache } from "@enpitsu/cache";
import { and, eq, not, schema, sql } from "@enpitsu/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  // Can login status
  getCanLoginStatus: adminProcedure.query(async () => {
    try {
      const status = await cache.get("login-status");

      return status
        ? { canLogin: JSON.parse(status) as boolean }
        : { canLogin: true };
    } catch (_) {
      return { canLogin: false };
    }
  }),

  updateCanLogin: adminProcedure
    .input(z.object({ canLogin: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        return await cache.set("login-status", JSON.stringify(input.canLogin));
      } catch (_) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Gagal memperbarui status, website ini otomatis tidak bisa login karena masalah dengan konektivitas caching system.",
        });
      }
    }),

  getAllRegisteredUser: adminProcedure.query(({ ctx }) =>
    ctx.db.query.users.findMany({
      where: and(
        sql`${schema.users.emailVerified} IS NOT NULL`,
        not(eq(schema.users.id, ctx.session.user.id)),
      ),
    }),
  ),

  // user approval and rejection start from here
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
    .mutation(({ ctx, input }) =>
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

        return tx.transaction(async (tx2) => {
          await tx2.delete(schema.users).where(eq(schema.users.id, input.id));
          await tx2
            .delete(schema.sessions)
            .where(eq(schema.sessions.userId, input.id));
          await tx2
            .delete(schema.accounts)
            .where(eq(schema.accounts.userId, input.id));
        });
      }),
    ),

  acceptPendingUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["admin", "user"]),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        if (ctx.session.user.id === input.id)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "R u lost ur mind?",
          });

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

        return await tx
          .update(schema.users)
          .set({
            emailVerified: new Date(),
            role: input.role,
          })
          .where(eq(schema.users.id, input.id));
      }),
    ),

  updateUserRole: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["admin", "user"]),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.transaction(async (tx) => {
        if (ctx.session.user.id === input.id)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Mana bisa begitu? Update role sendiri?",
          });

        const specificUser = await tx.query.users.findFirst({
          where: eq(schema.users.id, input.id),
        });

        if (!specificUser)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pengguna yang dituju tidak ditemukan!",
          });

        return await tx
          .update(schema.users)
          .set({
            role: input.role,
          })
          .where(eq(schema.users.id, input.id));
      }),
    ),
});
