import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { and, eq, not, sql } from "@enpitsu/db";
import * as schema from "@enpitsu/db/schema";
import { settings } from "@enpitsu/settings";
import {
  AppRoleSchema,
  BasicIdString,
  ToggleCanLoginSchema,
  ToggleEnforceAndroid,
  TokenSetting,
} from "@enpitsu/validator/admin";

import { adminProcedure } from "../trpc";

export const adminRouter = {
  // Can login status
  getCanLoginStatus: adminProcedure.query(() => {
    const { canLogin } = settings.getSettings();

    return { canLogin };
  }),

  updateCanLogin: adminProcedure
    .input(ToggleCanLoginSchema)
    .mutation(async ({ input }) => {
      try {
        return await settings.updateSettings.canLogin(input.canLogin);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err: unknown) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Gagal memperbarui status, website ini otomatis tidak bisa login karena masalah dengan konektivitas caching system.",
        });
      }
    }),

  getEnforceAndroidSetting: adminProcedure.query(() => {
    const { enforceMobileIfAndroid } = settings.getSettings();

    return { enforceMobileIfAndroid };
  }),

  updateAndroidEnforcingSetting: adminProcedure
    .input(ToggleEnforceAndroid)
    .mutation(async ({ input }) => {
      try {
        return await settings.updateSettings.enforceMobileIfAndroid(
          input.enforceMobileIfAndroid,
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err: unknown) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Gagal memperbarui status, terdapat masalah dengan konektivitas caching system.",
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
    .input(BasicIdString)
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
    .input(AppRoleSchema)
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
    .input(AppRoleSchema)
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

  getTokenSettings: adminProcedure.query(() => {
    const { tokenSource, tokenFlags, minimalTokenLength, maximalTokenLength } =
      settings.getSettings();

    return {
      tokenSource,
      tokenFlags,
      minimalTokenLength,
      maximalTokenLength,
    };
  }),

  updateTokenSettings: adminProcedure
    .input(TokenSetting)
    .mutation(async ({ input }) => {
      await settings.updateSettings.tokenSource(input.tokenSource);
      await settings.updateSettings.tokenFlags(input.tokenFlags);
      await settings.updateSettings.minimalTokenLength(
        input.minimalTokenLength,
      );
      await settings.updateSettings.maximalTokenLength(
        input.maximalTokenLength,
      );
    }),
} satisfies TRPCRouterRecord;
