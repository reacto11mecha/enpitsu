/* eslint-disable @typescript-eslint/unbound-method */
/* @see https://github.com/nextauthjs/next-auth/pull/8932 */

import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { InferSelectModel } from "@enpitsu/db";
import { db, eq, schema, tableCreator } from "@enpitsu/db";
import type { DefaultSession } from "next-auth";
import NextAuth from "next-auth";

export type { Session } from "next-auth";

declare module "@auth/core/adapters" {
  interface AdapterUser extends InferSelectModel<typeof schema.users> {
    role: "admin" | "user";
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: {
    ...DrizzleAdapter(db, tableCreator),
    async getSessionAndUser(data) {
      const sessionAndUsers = await db
        .select({
          session: schema.sessions,
          user: schema.users,
        })
        .from(schema.sessions)
        .where(eq(schema.sessions.sessionToken, data))
        .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId));

      return sessionAndUsers[0] ?? null;
    },
  },
  providers: [Google],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
  },
});
