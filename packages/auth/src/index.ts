import type { BetterAuthOptions } from "better-auth";
// import { expo } from "@better-auth/expo";
import { db } from "@enpitsu/db/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// import { oAuthProxy } from "better-auth/plugins";

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  googleClientId: string;
  googleClientSecret: string;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    // plugins: [
    //   oAuthProxy({
    //     /**
    //      * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
    //      */
    //     currentURL: options.baseUrl,
    //     productionURL: options.productionUrl,
    //   }),
    //   expo(),
    // ],
    socialProviders: {
      google: {
        clientId: options.googleClientId,
        clientSecret: options.googleClientSecret,
        redirectURI: `${options.productionUrl}/api/auth/callback/google`,
      },
    },
    // trustedOrigins: ["expo://"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
