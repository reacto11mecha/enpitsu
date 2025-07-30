import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import { skipCSRFCheck } from "@auth/core";
import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "@enpitsu/db";
import { db } from "@enpitsu/db/client";
import * as schema from "@enpitsu/db/schema";

import { env } from "../env";

type SelectUsers = typeof schema.users.$inferSelect;

declare module "@auth/core/adapters" {
  interface AdapterUser extends SelectUsers {
    role: "admin" | "user";
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      emailVerified: Date | null;
      role: "admin" | "user";
    } & DefaultSession["user"];
  }
}

const adapter = DrizzleAdapter(db, {
  usersTable: schema.users,
  accountsTable: schema.accounts,
  sessionsTable: schema.sessions,
});

export const isSecureContext = env.NODE_ENV !== "development";

export const authConfig = {
  adapter,
  // In development, we need to skip checks to allow Expo to work
  ...(!isSecureContext
    ? {
        skipCSRFCheck: skipCSRFCheck,
        trustHost: true,
      }
    : {}),
  secret: env.AUTH_SECRET,
  providers: [Google],
  callbacks: {
    session: async (opts) => {
      if (!("user" in opts))
        throw new Error("unreachable with session strategy");

      if (env.SPECIAL_ADMIN_USERS.includes(opts.user.email)) {
        if (!opts.user.emailVerified) {
          const emailVerified = new Date();

          await db
            .update(schema.users)
            .set({
              role: "admin",
              emailVerified,
            })
            .where(
              and(
                eq(schema.users.email, opts.user.email),
                eq(schema.users.id, opts.user.id),
              ),
            );

          return {
            ...opts.session,
            user: {
              ...opts.session.user,
              id: opts.user.id,
              role: "admin",
              emailVerified,
            },
          };
        }
      }

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
          role: opts.user.role,
          emailVerified: opts.user.emailVerified,
        },
      };
    },
  },
} satisfies NextAuthConfig;

export const validateToken = async (
  token: string,
): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const session = await adapter.getSessionAndUser?.(sessionToken);
  return session
    ? {
        user: {
          ...session.user,
        },
        expires: session.session.expires.toISOString(),
      }
    : null;
};

export const invalidateSessionToken = async (token: string) => {
  const sessionToken = token.slice("Bearer ".length);
  await adapter.deleteSession?.(sessionToken);
};
