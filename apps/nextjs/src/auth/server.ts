import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { initAuth } from "@enpitsu/auth";

import { env } from "~/env";

const baseUrl =
  env.NODE_ENV === "production" ? env.AUTH_URL : "http://localhost:3000";

export const auth = initAuth({
  baseUrl,
  productionUrl: env.AUTH_URL,
  secret: env.AUTH_SECRET,
  googleClientId: env.AUTH_GOOGLE_ID,
  googleClientSecret: env.AUTH_GOOGLE_SECRET,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
