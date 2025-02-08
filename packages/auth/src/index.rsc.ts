import { cache } from "react";
import NextAuth from "next-auth";

import { authConfig } from "./config";

export type { Session } from "next-auth";

const { handlers, auth: defaultAuth, signIn, signOut } = NextAuth(authConfig);

const auth = cache(defaultAuth);

export { handlers, auth, signIn, signOut };

export {
  invalidateSessionToken,
  validateToken,
  isSecureContext,
} from "./config";
